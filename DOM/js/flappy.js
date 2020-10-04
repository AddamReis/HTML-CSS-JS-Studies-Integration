function novoElemento(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
} //cria um novo elemento

function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira') //pega o elemento gerado e incluí a barreira

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo') //criou as duas partes da barreira

    this.elemento.appendChild(reversa ? corpo : borda) //verifica se vai aplicar primeiro o corpo ou a borda da barreria
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px` //ajusta a altura da barreira de acordo com o valor recebido
}

// const b = new Barreira(true)
// b.setAltura(300)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function ParDeBarreiras(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras') //div que envolve as duas barreiras

    this.superior = new Barreira(true) //barreira superior é reversa
    this.inferior = new Barreira(false) //barreira inferior não é reversa

    this.elemento.appendChild(this.superior.elemento) //adiciona a barreira ao elemento do novo novoElemento
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => { /*Gera randomicamente a autura superior, a inferior é calculada de acordo com o retorno*/
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0]) //em que momento o par de barreiras está
    this.setX = x => this.elemento.style.left = `${x}px` //alterando o valor a partir do valor passado
    this.getLargura = () => this.elemento.clientWidth //pega largura do elemento

    this.sortearAbertura() /*chama função para calcular os valores aleatórios*/
    this.setX(x) //seta o valor em cima do x
}

// const b = new ParDeBarreiras(700, 200, 800)
// document.querySelector('[wm-flappy]').appendChild(b.elemento) /*Testando altura das barreiras*/

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3//deslocamento das barrerias em px
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            // quando o elemento sair da área do jogo
            if (par.getX() < -par.getLargura()) { //a barreira sumiu completamente da tela
                par.setX(par.getX() + espaco * this.pares.length) //move a barreira que saiu da tela para a fila de barreiras inicial
                par.sortearAbertura() //gera uma nova abertura para a barreira incluída na fila
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio
            if(cruzouOMeio) notificarPonto() //se cruzou o meio da tela, adiciona o ponto no contador
        })
    }
}

function Passaro(alturaJogo) {
    let voando = false 

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true //se a tecla está pressionada o passaro sobe
    window.onkeyup = e => voando = false //se não o mesmo desce

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight //pega altura do passaro e subtrai com a autura do teto

        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY) //se o passaro não estiver nos limites da altura e largura, o mesmo se move na vertical
        }
    }
    this.setY(alturaJogo / 2) //define a posição inicial do pássaro
}



function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0) //inicializa com 0
}

// const barreiras = new Barreiras(700, 1200, 200, 400)
// const passaro = new Passaro(700)
// const areaDoJogo = document.querySelector('[wm-flappy]')
// areaDoJogo.appendChild(passaro.elemento)
// areaDoJogo.appendChild(new Progresso().elemento)
// barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
// setInterval(() => {
//     barreiras.animar()
//     passaro.animar()
// }, 20) /*teste de vôo*/

function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect() //pega o retangulo do pássaro
    const b = elementoB.getBoundingClientRect() //pega o retángulo das barrerias

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left //verifica se na horizontal ocorreu colisão
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top //verifica se na vertical ocorreu colisão
    return horizontal && vertical //se qualquer um for true o passaro colidiu com as barreiras
}

function colidiu(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras => {
        if (!colidiu) {
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior)
                || estaoSobrepostos(passaro.elemento, inferior) //se a colisão ocorreu retorna true
        }
    })
    return colidiu
}

function FlappyBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400,
        () => progresso.atualizarPontos(++pontos)) //chama função para atualizar os pontos quando a barreria passar do meio da tela
    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        // loop do jogo
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if (colidiu(passaro, barreiras)) {
                clearInterval(temporizador) //se colidiu para o temporizador
            }
        }, 20)
    }
}

new FlappyBird().start()