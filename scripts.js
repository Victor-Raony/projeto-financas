
const Modal = {
    open(){
        //Abrir modal
        //Adiconal a class activ ao modal
        document
        .querySelector('.modal-overlay')
        .classList
        .add('active')

    },
    close(){
        //Fechar modal
        //Remover a class active do modal
        document
        .querySelector('.modal-overlay')
        .classList
        .remove('active')

    }
}

const Storage = {
    //savar os dados localStore no google
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions){
        localStorage.setItem("dev.finances:transactions",
        JSON.stringify(transactions))
    },
}

//Eu preciso somar as entradas
//Depois eu preciso somar as saidas e 
//remover as entradas o valor das saidas
//assim, eu terei o total

const Transaction = {
            //somar as entradas
    all:  Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes(){
        let income = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0){
                income += transaction.amount;
            }
        })
        return income;
    },

    expense(){
        //somar as saidas
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0){
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total(){
        //calculo das entradas e saidas
        return Transaction.incomes() + Transaction.expense();
    }
}
//Eu preciso substituir os dados do HTML com os dados do JS

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        
        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index){

        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = 
        `
    
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})"  src="./assets/minus.svg" alt="Remover Transação">
        </td>
    
        `
        return html
    },

    updateBalance(){
        document.getElementById('incomeDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.incomes())

        document.getElementById('expenseDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.expense())

        document.getElementById('totalDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

//fomartação dos numeros para moeda brasileira

const Utils = {
    formtAmount(value){
        value = Number(value) * 100
        
        return value

    },

    formtDate(date){
        //formatação do campo data
        const splittdDate = date.split("-")
        return `${splittdDate[2]}/${splittdDate[1]}/${splittdDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-Br", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return{
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    formatValue(){
        let {description, amount, date} = Form.getValues()
        amount = Utils.formtAmount(amount)
        date = Utils.formtDate(date)

        return{
            description,
            amount,
            date
        }
        
    },

    validateField(){
        const {description, amount, date} = Form.getValues()
       
        if(description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "") {
                throw new Error("Por favor, preencha todos os campos")
            }
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event){
        event.preventDefault()

        try{
           Form.validateField()
           const transaction = Form.formatValue()
           //salvar fomrnulario
           Transaction.add(transaction)
           //apagar os dados do formulario
           Form.clearFields()
           //fechar o modal
           Modal.close()

        } catch (error){
            alert(error.message)
        }

    }
}

const App = {
    init() {
  // laço de repetição para os arrays da tabela de apresentação no index

    Transaction.all.forEach(DOM.addTransaction)
    DOM.updateBalance()

    Storage.set(Transaction.all)

},

    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()

