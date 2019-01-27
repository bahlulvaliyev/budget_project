//Budget controller
var budgetController = (function(){
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function (totalIncome) {
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
         data.allItem[type].forEach(function(cur){
            sum += cur.value;
         });
         data.totals[type] = sum;
    };

   var data = {
       allItem: {
           exp: [],
           inc: []
       },
       totals: {
           exp: 0,
           inc: 0
       },
       budget: 0,
       percentage: -1
   };

   return {
       addItem: function (type, des, val) {
           var newItem,ID;

           //Create new ID
           if(data.allItem[type].length > 0){
            ID = data.allItem[type][data.allItem[type].length - 1].id + 1;
           }
           else{
                ID = 0;
           }

           
           // Create new item based on 'inc' or 'exp' type
           if(type === 'exp'){
            newItem = new Expense(ID,des, val);
           }
           else if(type === 'inc'){
            newItem = new Income(ID,des, val);
           } 

           // Push it into our data structure
           data.allItem[type].push(newItem);

           // Return the new element
           return newItem;
        },
        deleteItem: function(type,id){
            var ids, index;
            //data.allItem[type][id];
            ids = data.allItem[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItem[type].splice(index, 1);
            }

        },
        calculateBudget: function(){
             
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc')
            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if(data.totals.inc > 0){
               data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            // expense 100 and income 200, spent 50%
        },

        calculatePercentages: function () {

            data.allItem.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function (cur){
                return cur.getPercentage();
              });
              return allPerc;
        },


        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function () {
            console.log(data);
        }
   }

})();

//UI controller

var UIController = (function(){
    var DOMString = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLagel: '.budget__expenses--percentage',
        container: '.container'
    };


    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMString.inputType).value,
                description: document.querySelector(DOMString.inputDescription).value,
                value: parseFloat(document.querySelector(DOMString.inputValue).value)
            };
        },
        addListItem: function (obj, type) {
            var html, newHtml, element;
            // create HTML string with placeholder text
            if(type === 'inc'){
                element = DOMString.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if (type === 'exp') {
                element = DOMString.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%',obj.value);

            // Insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMString.inputDescription + ', ' + DOMString.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array){
                current.value = "";
            });
            fieldsArr[0].focus();
        },
        displayBudget: function (obj) {
             document.querySelector(DOMString.budgetLabel).textContent = obj.budget;
             document.querySelector(DOMString.incomeLabel).textContent = obj.totalInc;
             document.querySelector(DOMString.expensesLabel).textContent = obj.totalExp;
             document.querySelector(DOMString.percentageLagel).textContent = obj.percentage;

             if (obj.percentage >= 0){
                document.querySelector(DOMString.percentageLagel).textContent = obj.percentage + '%';
             }
             else{
                document.querySelector(DOMString.percentageLagel).textContent = '---';
             }
        },
        getDom: function () {
            return DOMString;
        }
    }; 
})();

// Global app controller 

var controller = (function(budgetCtrl,UICtrl){

    var setupEventListener = function () {
        var DOM = UICtrl.getDom();
        document.querySelector(DOM.inputBtn).addEventListener('click', cntrlAddItem);

        document.addEventListener('keypress', function (e) {
             if(e.keyCode === 13 || e.which === 13){
                 cntrlAddItem();
             }
        });
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
    };



    var updateBadget = function(){

        // 1. Calculate the budget
        budgetCtrl.calculateBudget()

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();


        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget)
    }; 
    var updatePercentages = function () {

        // 1. calculate percentages
        budgetCtrl.calculatePercentages();
        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        // 3. Update the UI with the new percentages
        console.log(percentages);
    };
    var cntrlAddItem = function () {
        var input, newItem;
        // 1. Get the field input data
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value !== 0){

        // 2. Add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type,input.description,input.value);

        // 3. Add the item to the IU
        UICtrl.addListItem(newItem, input.type);

        //  4. Clear the fields
        UICtrl.clearFields();
       // 5. Calculate and update budget
        updateBadget();

        // 6. Calculate and update percentages
        updatePercentages();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemID,splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type,ID);

            // 2. delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. update and show the new budget
            updateBadget();
            // 4. Calculate and update percentages
            updatePercentages();

        }
    }
   return {
       init: function(){
           UICtrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: -1
        });
           setupEventListener();
       }
   }

})(budgetController,UIController);

controller.init();