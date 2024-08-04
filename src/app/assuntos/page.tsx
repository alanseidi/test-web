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
  codAs?: number;
  descricao: string;
  livros?: any[];
}

const Assuntos: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showModalLivros, setShowModalLivros] = useState(false);
  const [showModalItem, setShowModalItem] = useState(false);
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

  const {
    register: bRegister,
    handleSubmit: bHandleSubmit,
    setError: bSetError,
    reset: bReset,
    setValue: bSetValue,
    formState: { errors: bErrors, isValid: bIsValid },
  } = useForm({
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {} as any,
  });

  const onSubmit = async (values: IFormData) => {
    setIsLoading(true);
    try {
      if (values.codAs !== undefined && values.codAs !== null) {
        await axios.put(`/assunto/${values.codAs}`, values);
      } else {
        await axios.post('/assunto', values);
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
      const response = await axios.get(`/assunto?page=${page}`);
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
    setValue('descricao', item.descricao);
    setValue('codAs', item.codAs);
  };

  const deleteItem = async (codItem: number) => {
    setShowAlert(false);
    await axios.delete(`/assunto/${codItem}`);
    setAlertMessage('Item excluido com sucesso!');
    setShowAlert(true);
    await getListData();
  };

  const getBookList = async () => {
    const response = await axios.get(`/livro`);
    setBooks(response.data.data);
  };
  const syncBooks = async (lItem: IFormData) => {
    await getBookList();
    bSetValue('codAs', item.codAs);
    bSetValue('arrayCodL', []);
    setItem(lItem);
    setShowModalLivros(true);
  };

  const bOnSubmit = async (values: any) => {
    try {
      values.codAs = item.codAs;
      await axios.post(`/assunto/associar-livro`, values);
      bReset();
      setAlertMessage('Item salvo com sucesso!');
      setShowAlert(true);
      await getListData();
      setShowModalLivros(false);
    } catch (e: any) {
      if (e.response.status === 422) {
        for (const err in e.response.data.errors) {
          bSetError(err as any, {
            type: 'manual',
            message: e.response.data.errors[err][0],
          });
        }
      }
    }
  };

  const openModalItemView = async (lItem: IFormData) => {
    const response = await axios.get(`/assunto/${lItem.codAs}`);
    setItem(response.data.data);
    setShowModalItem(true);
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
            <h1 className='h3 mt-4'>Pagina de assuntos</h1>
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
            <Form.Control type='text' placeholder='codAs' hidden />

            <Form.Group
              className='mb-4'
              as={Col}
              controlId='input-name'
              xs={12}
              md={6}
            >
              <Form.Label>Descrição*</Form.Label>
              <Form.Control
                type='text'
                required
                isInvalid={!!errors.descricao}
                maxLength={40}
                {...register('descricao', {
                  required: 'Campo obrigatório',
                })}
              />

              {errors.descricao && (
                <Form.Control.Feedback type='invalid'>
                  {errors.descricao.message}
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
                  <th>Descrição</th>
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
                        <td>{item.codAs}</td>
                        <td>{item.descricao}</td>
                        <td>
                          {item.livros.map(function (livro: any, li: number) {
                            return (
                              <span
                                className='d-block border-bottom border-dark mb-2'
                                key={`livro-${i}-${li}`}
                              >
                                {livro.titulo}
                              </span>
                            );
                          })}
                        </td>
                        <td className='text-center'>
                          <div className='d-flex justify-content-center gap-2 align-items-center'>
                            <Button
                              type='button'
                              size='sm'
                              variant='primary'
                              onClick={() => openModalItemView(item)}
                            >
                              Ver
                            </Button>
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
                              onClick={() => deleteItem(item.codAs)}
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
      <Modal
        show={showModalLivros}
        onHide={() => setShowModalLivros(false)}
        backdrop='static'
      >
        <Form
          noValidate
          onSubmit={bHandleSubmit(bOnSubmit)}
          validated={bIsValid}
        >
          <Modal.Header closeButton>
            <Modal.Title>Associar Livros</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container>
              <Row>
                <Col xs={12}>
                  <h5 className='h6'>Descrição: {item.descricao}</h5>
                </Col>
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Livros</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='codAs'
                      hidden
                      {...register('codAs', { value: item.codAs })}
                    />
                    <Form.Select multiple {...bRegister('arrayCodL')}>
                      {books.map((book: any, i) => {
                        return (
                          <option key={`book-list-${i}`} value={book.codL}>
                            {book.titulo}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant='secondary'
              onClick={() => setShowModalLivros(false)}
            >
              Fechar
            </Button>
            <Button variant='primary' type='submit'>
              Salvar
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={showModalItem}
        onHide={() => setShowModalItem(false)}
        backdrop='static'
      >
        <Modal.Header closeButton>
          <Modal.Title>Visualização</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Row>
              <Col xs={12}>Descrição: {item.descricao}</Col>
              {item?.livros && item.livros?.length > 0 && (
                <Col xs={12}>
                  <p>Livros: </p>
                  <ul>
                    {item.livros?.map((book: any, i) => {
                      return <li key={`livro-${i}`}>{book.titulo}</li>;
                    })}
                  </ul>
                </Col>
              )}
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowModalItem(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Assuntos;
