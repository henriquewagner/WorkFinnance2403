import { Router } from "express";
import { randomUUID } from "node:crypto";
import { Database } from "../database";
import { timeStamp } from "node:console";

const userRoute = Router();

const database = new Database();

const table = "user";

userRoute.get("/", (request, response) => {
  const user = database.select(table);
  response.json(user);
});

userRoute.get("/:id", (request, response) => {
  const { id } = request.params;

  const result = database.select(table, id);

  // console.log(result, " - ", typeof result);

  if (result === undefined)
    response.status(400).json({ msg: "Usuário não encontrado!" });

  response.json(result);
});

// Parâmetro que esta vindo do CLIENTE - REQUEST
// Parâmetro que esta indo para o CLIENTE - RESPONSE


// alterar o usuario
userRoute.put("/alterar/:id", (request, response) => {
  const { id } = request.params;
  const { name, address, zipCode, cpf, saldo, transacao } = request.body;

  const userExist: any = database.select(table, id);
  if (userExist === undefined)
    return response.status(400).json({ msg: "Usuário não encontrado!" });

  database.update(table, id, { name, address, zipCode, cpf, saldo, transacao });

  response.status(201).json({ msg: `O ID ${id} foi alterado com sucesso!` });
});

// contexto para os calculos
userRoute.post("/", (request, response) => {
  const { name, saldo, transacao, address, zipCode, cpf } = request.body;

  const user = {
    id: randomUUID(),
    name,
    address,
    zipCode,
    cpf,
    saldo,
    transacao
  };

  database.insert(table, user);

  response.status(201).json({ msg: "Sua conta foi cadastrada!" });
});

userRoute.delete("/:id", (request, response) => {
  const { id } = request.params;

  const userExist: any = database.select(table, id);

  if (userExist === undefined)
    return response.status(400).json({ msg: "Usuário não encontrado!" });

  database.delete(table, id);

  response
    .status(202)
    .json({ msg: `Usuário ${userExist.name} foi deletado com sucesso` });
});

userRoute.put('/sacar/:id', (request,response)=>{

  const {id} = request.params
  const {name, transacao: [{ tipo, valor}]} = request.body

  const userExist:any = database.select(table, id);

  if(userExist === undefined)
  return response.status(400).json(
    {msg:'Usuario nao encontrado'});

    let transacao = userExist.transacao
    transacao.push({tipo:"Saque", valor})
    console.log(transacao)
    let saldo = userExist.saldo
    database.update(table, id, {id, name, saldo: saldo - valor, transacao})

    response.status(201).json(
      {msg: ` Saque de ${valor} reais foi realizado com sucesso` });

})

userRoute.put('/depositar/:id', (request,response)=>{

  const {id} = request.params
  const {name, transacao: [{ tipo, valor}]} = request.body

  const userExist:any = database.select(table, id);


  if(userExist === undefined)
  return response.status(400).json(
    {msg:'Usuario nao encontrado'});

    let transacao = userExist.transacao
    transacao.push({tipo:"Deposito", valor})
    console.log(transacao)
    let saldo = userExist.saldo
    database.update(table, id, {id, name, saldo: saldo + valor, transacao})

    response.status(201).json(
      {msg: ` Depositado o valor de ${valor} reais em sua conta!` });

})

export { userRoute };
