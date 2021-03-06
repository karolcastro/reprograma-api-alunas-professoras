
// arquivo controler
const alunas = require('../model/alunas.json')
const fs = require('fs'); // arquivo file system para gravar as informações
const bcrypt = require("bcrypt");// requisicao do bcrypt
const bcryptSalt = 8;// qnt que vai embaralhar

/*router.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const salt     = bcrypt.genSaltSync(bcryptSalt);
  const hashPass = bcrypt.hashSync(password, salt);
*/

// esta pegando a lista de todas as alunas

// buscar por id
exports.getById = (req, res) => {
    const id = req.params.id// é o objeto de tudo que vc quer passar
    if (id > 17 || id <= 0) {
        // res.send(' id nao é valido')
        res.redirect(301, 'https://www.mercadolivre.com.br/')// pode colocar qualquer pagina
    }
    res.status(200).send(alunas.find(aluna => aluna.id == id))
}

//buscar livro
exports.getBooks = (req, res) => {
    const id = req.params.id
    const aluna = alunas.find(aluna => aluna.id == id)

    if (!aluna) {
        res.send('nao encontrei esta aluna')
    }
    const livros = aluna.livros
    const livrosLivros = livros.filter(livro => livro.leu == "true")
    res.status(200).send(livrosLivros)
}

//buscar em mora em SP
exports.getSp = (req, res) => {
    const SP = alunas.filter(nasceuSP => nasceuSP.nasceuEmSp == "true")
    const nomesSp = []// array que vai ter o nome das alunas
    SP.map(aluna => nomesSp.push(aluna.nome)) // procurar os nomes das alunas e puxar para a array aluna
    res.status(200).send(nomesSp)// mostra na tela o nome das alunas 

}
// buscar idade 
exports.getIdade = (req, res) => {
    const id = req.params.id // req = requisicao
    const aluna = alunas.find(item => item.id == id)// objeto nao itera com map ou outro //o segundo id é o que esta na const id
    const data = aluna.dateOfBirth
    const arrData = data.split('/')// separar dentro da array
    const dia = arrData[0]// posicao que o dia vai ficar dentro da array
    const mes = arrData[1]
    const ano = arrData[2]
    const idade = calcularIdade(ano, mes, dia)
    // console.log(data)
    res.status(200).send({ idade })// colocar {} para ele aceitar que é um objeto e nao uma istring

}
function calcularIdade(anoDeNasc, mesDeNasc, diaDeNasc) { // para calcular a idade
    const now = new Date()// instancia da data no dia de hoje
    const anoAtual = now.getFullYear()// instancia do ano
    const mesAtual = now.getMonth() + 1// instancia do mes
    const hoje = now.getDate()// instancia do dia

    let idade = anoAtual - anoDeNasc //

    if (mesAtual < mesDeNasc || (mesAtual == mesDeNasc && hoje < diaDeNasc)) {
        idade -= 1
    }// funcao para calcular o mes correto que a menina faz aniversario
    return idade
}


// post

// fazer o post para gravar as informacoes que foram acrescentadas no postman
// function caso tenha erro devolve uma resposta com o if
exports.post = async (req, res) => {// metodo sincrono
    const { nome, password, dateOfBirth, nasceuEmSp, id, livros } = req.body;// password  gera a senha
    const salt = bcrypt.genSaltSync(bcryptSalt);//identifica a quantidade de saltos
    try {// tentativa de excucao do codigo
        const hashPass = await bcrypt.hashSync(password, salt);
        alunas.push({ nome, hashPass, dateOfBirth, nasceuEmSp, id, livros });// hash transforma a senha
    

        //arquivo fs para conseguir escrever // utf8 é para entender os caracteres especiais
        fs.writeFile('./src/model/alunas.json', JSON.stringify(alunas), 'utf8', function (err) {
            if (err) {
                return res.status(500).send({ message: err });
            }
            console.log(' The file was saved!')
        });
        return res.status(201).send(alunas);
    } catch (error) {// caso der erro o catch entra para informar um erro
        return res.status(401).json({ error: 'error' });
    }
}

// acrescentar um livro novo
exports.postBooks = (req, res) => {
    const id = req.params.id
    const aluna = alunas.find(aluna => aluna.id == id)
    if (!aluna) {
        res.send('Nao encontrei esta aluna')
    }
    const { titulo, leu } = req.body;
    alunas[aluna.id - 1].livros.push({ titulo, leu });

    fs.writeFile('./src/model/alunas.json', JSON.stringify(alunas), 'utf8', function (err) {
        if (err) {
            return res.status(500).send({ message: err });
        }
        console.log('The file was saved! ')
    })
    return res.status(201).send(alunas[aluna.id - 1].livros);
}


