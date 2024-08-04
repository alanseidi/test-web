'use client';
import React, { useEffect, useState } from 'react';
import {
  Col,
  Container,
  Form,
  Row,
  Button,
  Spinner,
  Alert,
  Table,
  Pagination,
  Modal,
} from 'react-bootstrap';
import { FieldErrors, useForm } from 'react-hook-form';
import axios from '@/lib/axios';
import { parseUrl } from 'next/dist/shared/lib/router/utils/parse-url';

interface IFormData {
  codAu?: number;
  nome: string;
}
interface IFormErrors {
  [key: string]: {
    message: string[];
    type: string;
  };
}

const Autores: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [item, setItem] = useState({} as IFormData);

  const [list, setList] = useState([]);
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState<any>([]);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {} as IFormData,
  });

  const onSubmit = async (values: IFormData) => {
    setIsLoading(true);
    try {
      if (values.codAu !== undefined && values.codAu !== null) {
        await axios.put(`/autor/${values.codAu}`, values);
      } else {
        await axios.post('/autor', values);
      }

      reset();
      setAlertMessage('Item salvo com sucesso!');
      setShowAlert(true);
      await getListData();
    } catch (e: any) {
      if (e.response.status === 422) {
        for (const err in e.response.data.errors) {
          setError(err as any, {
            type: 'manual',
            message: e.response.data.errors[err][0],
          });
        }
      }
    }
    setIsLoading(false);
  };

  const onError = (error: FieldErrors) => {
    console.log(isValid);
  };

  const getListData = async (page = 1) => {
    setIsLoadingList(true);
    try {
      const response = await axios.get(`/autor?page=${page}`);
      setList(response.data.data);
      setPagination(response.data.meta.links);
    } catch (e: any) {
      console.log(e);
    }
    setIsLoadingList(false);
  };

  const getPageFromUrl = (url: any) => {
    const parsedUrl = parseUrl(url);
    return (parsedUrl.query.page as any) ?? 1;
  };

  const setEditData = (item: IFormData) => {
    reset();
    setValue('nome', item.nome);
    setValue('codAu', item.codAu);
  };

  const deleteItem = async (codItem: number) => {
    setShowAlert(false);
    await axios.delete(`/autor/${codItem}`);
    setAlertMessage('Item excluido com sucesso!');
    setShowAlert(true);
    await getListData();
  };

  const syncBooks = (lItem: IFormData) => {
    setItem(lItem);
    setShowModal(true);
  };
  useEffect(() => {
    getListData();
    return setList([]);
  }, []);
  return (
    <>
      <Container>
        <Row>
          <Col xs={12}>
            <h1 className='h3 mt-4'>Pagina de autores</h1>
          </Col>
        </Row>
        <Form
          noValidate
          onSubmit={handleSubmit(onSubmit, onError)}
          validated={isValid}
        >
          <Alert
            variant='success'
            onClose={() => setShowAlert(false)}
            dismissible
            show={showAlert}
          >
            {alertMessage}
          </Alert>
          <Row>
            <Col xs={12}>
              <h5 className='h5 mt-4'>Formulário</h5>
            </Col>
            <Form.Control type='text' placeholder='codAu' hidden />

            <Form.Group
              className='mb-4'
              as={Col}
              controlId='input-name'
              xs={12}
              md={6}
            >
              <Form.Label>Nome do autor*</Form.Label>
              <Form.Control
                type='text'
                required
                isInvalid={!!errors.nome}
                maxLength={40}
                {...register('nome', {
                  required: 'Campo obrigatório',
                })}
              />

              {errors.nome && (
                <Form.Control.Feedback type='invalid'>
                  {errors.nome.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Col xs={12}>
              <Button variant='success' type='submit' disabled={isLoading}>
                {isLoading && <Spinner size='sm' />} Salvar
              </Button>
            </Col>
          </Row>
        </Form>

        <Row className='mt-4'>
          <Col xs={12}>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nome do autor</th>
                  <th>Livros</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {isLoadingList && (
                  <tr>
                    <td colSpan={4} className='text-center'>
                      <Spinner />
                    </td>
                  </tr>
                )}
                {!isLoadingList &&
                  list.map(function (item: any, i) {
                    return (
                      <tr key={`item-list-${i}`}>
                        <td>{item.codAu}</td>
                        <td>{item.nome}</td>
                        <td>
                          {item.livros.map(function (livro: any, li: number) {
                            return <p key={`livro-${i}`}>{livro.title}</p>;
                          })}
                        </td>
                        <td className='text-center'>
                          <div className='d-flex justify-content-center gap-2 align-items-center'>
                            <Button
                              type='button'
                              size='sm'
                              variant='primary'
                              onClick={() => setEditData(item)}
                            >
                              Editar
                            </Button>

                            <Button
                              type='button'
                              size='sm'
                              variant='warning'
                              onClick={() => deleteItem(item.codAu)}
                            >
                              Excluir
                            </Button>

                            <Button
                              type='button'
                              size='sm'
                              variant='success'
                              onClick={() => syncBooks(item)}
                            >
                              Associar Livro
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </Table>
            <Pagination>
              {pagination.map((item: any, i: number) => {
                return (
                  <div key={`pagination-${i}`}>
                    {i === 0 && (
                      <Pagination.First
                        disabled={item.url === null}
                        onClick={() =>
                          getListData(getPageFromUrl(item.url ?? ''))
                        }
                      />
                    )}
                    {i !== pagination.length - 1 && i !== 0 && (
                      <Pagination.Item
                        disabled={item.url === null || item.active}
                        onClick={() => getListData(getPageFromUrl(item.url))}
                      >
                        {item.label}
                      </Pagination.Item>
                    )}

                    {i === pagination.length - 1 && (
                      <Pagination.Last
                        onClick={() =>
                          getListData(
                            getPageFromUrl(
                              pagination[pagination.length - 1].url ?? ''
                            )
                          )
                        }
                      />
                    )}
                  </div>
                );
              })}
            </Pagination>
          </Col>
        </Row>
      </Container>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Associar Livros</Modal.Title>
        </Modal.Header>
        <Modal.Body>Woohoo, you are reading this text in a modal!</Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowModal(false)}>
            Fechar
          </Button>
          <Button variant='primary' onClick={() => setShowModal(false)}>
            Salvar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Autores;
