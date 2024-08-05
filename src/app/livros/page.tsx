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
import { InputMask } from '@react-input/mask';
import { InputNumberFormat } from '@react-input/number-format';

interface IFormData {
  codL?: number;
  titulo: string;
  editora: string;
  edicao: number;
  anoPublicacao: string;
  preco: string | number;
  assuntos?: any[];
  autores?: any[];
}

const Livros: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showModalSync, setShowModalSync] = useState(false);
  const [showModalItem, setShowModalItem] = useState(false);
  const [item, setItem] = useState({} as IFormData);

  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState<any>([]);
  const [assuntos, setAssuntos] = useState<any>([]);
  const [autores, setAutores] = useState<any>([]);

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
    if (values.anoPublicacao.length < 4) {
      setError('anoPublicacao', {
        type: 'manual',
        message: 'Coloque um ano válido',
      });
      setIsLoading(false);
      return;
    }
    if (typeof values.preco !== 'number') {
      const preco = values.preco.replace('R$ ', '');
      values.preco = parseFloat(preco.replace(/\./g, '').replace(',', '.'));
    }
    try {
      if (values.codL !== undefined && values.codL !== null) {
        await axios.put(`/livro/${values.codL}`, values);
      } else {
        await axios.post('/livro', values);
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
      const response = await axios.get(`/livro?page=${page}`);
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
    setValue('codL', item.codL);
    setValue('titulo', item.titulo);
    setValue('editora', item.editora);
    setValue('edicao', item.edicao);
    setValue('anoPublicacao', item.anoPublicacao);
    setValue(
      'preco',
      item.preco.toLocaleString('pt-br', { minimumFractionDigits: 2 })
    );
  };

  const deleteItem = async (codItem: number) => {
    setShowAlert(false);
    await axios.delete(`/livro/${codItem}`);
    setAlertMessage('Item excluido com sucesso!');
    setShowAlert(true);
    await getListData();
  };

  const openModalItemView = async (lItem: IFormData) => {
    const response = await axios.get(`/livro/${lItem.codL}`);
    setItem(response.data.data);
    setShowModalItem(true);
  };

  const bOnSubmit = async (values: any) => {
    try {
      console.log(values);
      values.codL = item.codL;
      await axios.post(`/livro/associar-autor`, values);
      await axios.post(`/livro/associar-assunto`, values);
      bReset();
      setAlertMessage('Item salvo com sucesso!');
      setShowAlert(true);
      await getListData();
      setShowModalSync(false);
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
  const getAutorList = async () => {
    const response = await axios.get(`/autor`);
    setAutores(response.data.data);
  };
  const getAssuntoList = async () => {
    const response = await axios.get(`/assunto`);
    setAssuntos(response.data.data);
  };
  const syncData = async (lItem: IFormData) => {
    await getAutorList();
    await getAssuntoList();
    bSetValue('codL', item.codL);
    bSetValue('arrayCodAs', []);
    bSetValue('arrayCodAu', []);
    setItem(lItem);
    setShowModalSync(true);
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
            <h1 className='h3 mt-4'>Pagina de livros</h1>
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
            <Form.Control type='text' placeholder='codL' hidden />

            <Form.Group
              className='mb-4'
              as={Col}
              controlId='input-name'
              xs={12}
              md={6}
            >
              <Form.Label>Título*</Form.Label>
              <Form.Control
                type='text'
                required
                isInvalid={!!errors.titulo}
                maxLength={40}
                {...register('titulo', {
                  required: 'Campo obrigatório',
                })}
              />

              {errors.titulo && (
                <Form.Control.Feedback type='invalid'>
                  {errors.titulo.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
            <Form.Group
              className='mb-4'
              as={Col}
              controlId='input-name'
              xs={12}
              md={6}
            >
              <Form.Label>Editora*</Form.Label>
              <Form.Control
                type='text'
                required
                isInvalid={!!errors.editora}
                maxLength={40}
                {...register('editora', {
                  required: 'Campo obrigatório',
                })}
              />

              {errors.editora && (
                <Form.Control.Feedback type='invalid'>
                  {errors.editora.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
            <Form.Group
              className='mb-4'
              as={Col}
              controlId='input-name'
              xs={12}
              md={6}
            >
              <Form.Label>Edição*</Form.Label>
              <Form.Control
                type='number'
                required
                isInvalid={!!errors.edicao}
                {...register('edicao', {
                  required: 'Campo obrigatório',
                })}
              />

              {errors.edicao && (
                <Form.Control.Feedback type='invalid'>
                  {errors.edicao.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group
              className='mb-4'
              as={Col}
              controlId='input-name'
              xs={12}
              md={6}
            >
              <Form.Label>Ano da publicação*</Form.Label>

              <Form.Control
                as={InputMask}
                required
                isInvalid={!!errors.anoPublicacao}
                type='text'
                minLength={4}
                mask='____'
                replacement={{ _: /\d/ }}
                {...register('anoPublicacao', {
                  required: 'Campo obrigatório',
                })}
              />

              {errors.anoPublicacao && (
                <Form.Control.Feedback type='invalid'>
                  {errors.anoPublicacao.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group
              className='mb-4'
              as={Col}
              controlId='input-name'
              xs={12}
              md={6}
            >
              <Form.Label>Preço*</Form.Label>

              <Form.Control
                as={InputNumberFormat}
                required
                isInvalid={!!errors.preco}
                type='text'
                locales='pt-BR'
                format='currency'
                currency='BRL'
                maximumIntegerDigits={7}
                {...register('preco', {
                  required: 'Campo obrigatório',
                })}
              />

              {errors.preco && (
                <Form.Control.Feedback type='invalid'>
                  {errors.preco.message}
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
                  <th>Título</th>
                  <th>Editora</th>
                  <th>Edição</th>
                  <th>Ano da Publicação</th>
                  <th>Preço</th>
                  <th>Autor</th>
                  <th>Assunto</th>
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
                        <td>{item.codL}</td>
                        <td>{item.titulo}</td>
                        <td>{item.editora}</td>
                        <td>{item.edicao}</td>
                        <td>{item.anoPublicacao}</td>
                        <td>
                          {item.preco.toLocaleString('pt-br', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </td>
                        <td>
                          {item.autores.map(function (autor: any, li: number) {
                            return (
                              <span
                                className='d-block border-bottom border-dark mb-2'
                                key={`autor-${i}-${li}`}
                              >
                                {autor.nome}
                              </span>
                            );
                          })}
                        </td>
                        <td>
                          {item.assuntos.map(function (
                            assunto: any,
                            li: number
                          ) {
                            return (
                              <span
                                className='d-block border-bottom border-dark mb-2'
                                key={`assunto-${i}-${li}`}
                              >
                                {assunto.descricao}
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
                              onClick={() => deleteItem(item.codL)}
                            >
                              Excluir
                            </Button>

                            <Button
                              type='button'
                              size='sm'
                              variant='success'
                              onClick={() => syncData(item)}
                            >
                              Associar Autor/Assunto
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
        show={showModalSync}
        onHide={() => setShowModalSync(false)}
        backdrop='static'
      >
        <Form
          noValidate
          onSubmit={bHandleSubmit(bOnSubmit)}
          validated={bIsValid}
        >
          <Modal.Header closeButton>
            <Modal.Title>Associar</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container>
              <Row>
                <Col xs={12}>
                  <h5 className='h6'>Livro: {item.titulo}</h5>
                  <Form.Control
                    type='text'
                    placeholder='codau'
                    hidden
                    {...register('codL', { value: item.codL })}
                  />
                </Col>
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Autores</Form.Label>

                    <Form.Select multiple {...bRegister('arrayCodAu')}>
                      {autores.map((autor: any, i: number) => {
                        return (
                          <option key={`autor-list-${i}`} value={autor.codAu}>
                            {autor.nome}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12} className='mt-4'>
                  <Form.Group>
                    <Form.Label>Assuntos</Form.Label>

                    <Form.Select multiple {...bRegister('arrayCodAs')}>
                      {assuntos.map((assunto: any, i: number) => {
                        return (
                          <option
                            key={`assunto-list-${i}`}
                            value={assunto.codAs}
                          >
                            {assunto.descricao}
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
            <Button variant='secondary' onClick={() => setShowModalSync(false)}>
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
              <Col xs={12}>Título: {item.titulo}</Col>
              <Col xs={12}>Editora: {item.editora}</Col>
              <Col xs={12}>Edição: {item.edicao}</Col>
              <Col xs={12}>Ano da Publicação: {item.anoPublicacao}</Col>
              <Col xs={12}>
                Preço:
                {item?.autores &&
                  item.preco.toLocaleString('pt-br', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
              </Col>
              {item?.autores && item.autores?.length > 0 && (
                <Col xs={12}>
                  <p>Autores: </p>
                  <ul>
                    {item.autores?.map((autor: any, i) => {
                      return <li key={`autor-${i}`}>{autor.nome}</li>;
                    })}
                  </ul>
                </Col>
              )}
              {item?.assuntos && item.assuntos?.length > 0 && (
                <Col xs={12}>
                  <p>Assuntos: </p>
                  <ul>
                    {item.assuntos?.map((assunto: any, i) => {
                      return <li key={`assunto-${i}`}>{assunto.descricao}</li>;
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

export default Livros;
