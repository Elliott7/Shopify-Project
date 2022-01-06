const myPopUpButton = document.getElementById("my-wizard-button")
const myPopUpCont = document.getElementById("my-wizard-container-container")
const modalBackdrop = document.getElementById("modal-backdrop")
const slidePage = document.querySelector(".slide-page");
const nextBtnFirst = document.querySelector(".firstNext");
const prevBtnSec = document.querySelector(".prev-1");
const nextBtnSec = document.querySelector(".next-1");
const prevBtnThird = document.querySelector(".prev-2");
const nextBtnThird = document.querySelector(".next-2");
const progressText = document.querySelectorAll(".wizard-step p");
const progressCheck = document.querySelectorAll(".wizard-step .wizard-check");
const bullet = document.querySelectorAll(".wizard-step .wizard-bullet");
const wizardSlides = document.getElementById("wizard-slides-id")
const questionOneInputs = document.getElementsByClassName("question-1-inputs")
const questionTwoInputs = document.getElementsByClassName("question-2-inputs")
const questionThreeInputs = document.getElementsByClassName("question-3-inputs")
const checkoutButton = document.getElementById("wizard-checkout-button")
const recommendationButton = document.getElementById("wizard-recommendation-page-button")
const wizardCloseButton = document.getElementById("wizard-close-button")
let current = 1;
let answer1;
let answer2;
let answer3;
let checkoutLinks = [];
let recommendationLink;

function wizardToggle(){
    myPopUpCont.classList.toggle('hide')
    modalBackdrop.classList.toggle('hide')
}
myPopUpButton.addEventListener("click", () => {
	wizardToggle()
    window.scrollTo(0, 0)
})

modalBackdrop.addEventListener("click", () => {
    wizardToggle()
})

wizardCloseButton.addEventListener("click", () => {
    wizardToggle()
})


function changeStyling(event, margin, decrement, currentChange){
	event.preventDefault();
 	slidePage.style.marginLeft = margin;
    bullet[current - decrement].classList.add("active");
    progressCheck[current - decrement].classList.add("active");
    progressText[current - decrement].classList.add("active");
    current += currentChange;
}

function changeStylingRemove(event, margin, decrement, currentChange){
	event.preventDefault();
 	slidePage.style.marginLeft = margin;
    bullet[current - decrement].classList.remove("active");
    progressCheck[current - decrement].classList.remove("active");
    progressText[current - decrement].classList.remove("active");
    current -= currentChange;
}

nextBtnFirst.addEventListener("click", function(event){
  	changeStyling(event, "-25%", 1, 1)  
    answer1 = getResult("question1")

});

nextBtnSec.addEventListener("click", function(event){
  	changeStyling(event, "-50%", 1, 1) 
    answer2 = getResult("question2")
});

nextBtnThird.addEventListener("click", function(event){
	changeStyling(event, "-75%", 1, 1) 
    answer3 = getResult("question3")
    filterResults()
    updateRecommendationLink([answer1, answer2, answer3]).update()

});

prevBtnSec.addEventListener("click", function(event){
  	changeStylingRemove(event, "0%", 2, 1)
});

prevBtnThird.addEventListener("click", function(event){
  	changeStylingRemove(event, "-25%", 2, 1)
});

checkoutButton.addEventListener("click", () => {
    window.location = checkoutLinks[0]                           
})

recommendationButton.addEventListener("click", () => {
    window.location = recommendationLink                   
})

for (let i = 0; i < questionOneInputs.length; i++){
  questionOneInputs[i].addEventListener('click',() => {
    nextBtnFirst.disabled = false;
    answer1 = questionOneInputs[i].value
                                        })
}

for (let j = 0; j < questionTwoInputs.length; j++){
  questionTwoInputs[j].addEventListener('click',() => {
    nextBtnSec.disabled = false;
    answer2 = questionTwoInputs[j].value
                                        })
}

for (let k = 0; k < questionThreeInputs.length; k++){
  questionThreeInputs[k].addEventListener('click',() => {
    nextBtnThird.disabled = false;
    answer3 = questionThreeInputs[k].value
                                        })
}

function getResult(option) {
    const elements = document.getElementsByName(option)
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].checked) {
            return elements[i].value
        }
    }
}

let myObj = [] 
let myQuery = `{
                products(first: 50) {
                  edges {
                    node {
                      id
                      title
                      images(first: 1) {
                        edges {
                          node {
                            transformedSrc(maxHeight: 200, maxWidth: 200)
                          }
                        }
                      }
                      description
                      handle
                      priceRange {
                        minVariantPrice {
                          amount
                        }
                      }
                      tags
                      vendor
                    }
                  }
                }
              }
`;

function apiCall(myQuery){
  return fetch('https://royalswanwatches.myshopify.com/api/2022-01/graphql.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/graphql',
      "Access-Control-Origin": "*",
      "X-Shopify-Storefront-Access-Token": "83dc981a3602665003b4563143e0cc3c"
    },
    "body": myQuery
  }).then(response => response.json())
  .catch((error) => {console.error('Error:', error);
                    });;
}  

  
//   Calls the query, adds the product data to an object for later use
//   Used to grab all of the products to then be filtered by the users choices
function call(){
  apiCall(myQuery).then(response => {
    response.data.products.edges.forEach(product => {
      let temp = {
        handle: product.node.handle,
        imgSrc: product.node.images.edges[0].node.transformedSrc,
        price: product.node.priceRange.minVariantPrice.amount,
        title: product.node.title,
        tags: product.node.tags,
        id: product.node.id,
        vendor: product.node.vendor
      }
      myObj.push(temp)
    })
  })
}

// Takes in the answers and returns an array containing valid tags - it excludes the preference option
function removeNoPref(answers){
	let answersArray = []
    for (let item of answers){
      if (item != "No Preference"){
        answersArray.push(`${item}`)
      }
    }
    return answersArray
}



// Takes in all the answers, removes the no preference options, deteremines a suitable recommendations link and then updates the link
function updateRecommendationLink(answersArr){
  answersArr = removeNoPref(answersArr)
  function alternativesPage(){
      let options
      if (answersArr.length > 1){
        options = `${answersArr[0]}+${answersArr[1]}`
      } else{
        options = `${answersArr[0]}`
      }
      return `https://royalswanwatches.myshopify.com/collections/you-may-also-like/${options}`
    }
  function update(){
    recommendationLink = alternativesPage()
  }
  return {update}
}

// Used to create the main product template once the results have been filtered
function createProductTemplate(product, count){
  const template = 
        `<div id='slide-${count}' class="wizard-added-slides">
		   <a id='${product.id}' href=#>
             <div class='wizard-product-card'> 		  
               <img src=${product.imgSrc} class="wizard-added-picture"></img>
			   <h5 class="wizard-added-title">${product.title} <span class="wizard-vendor">${product.vendor}</span></h5> 		  
			   
               <hr class="wizard-division-line">
               <span class="wizard-added-price">$${parseInt(product.price)}</span>
             </div>
           </a>
         </div>
		`;
  return template
}


// Returns an array of all the permutations of an array to a given size
function getPermutations(array, size) {
    function p(t, i) {
        if (t.length === size) {
            result.push(t);
            return;
        }
        if (i + 1 > array.length) {
            return;
        }
        p(t.concat(array[i]), i + 1);
        p(t, i + 1);
    }

    let result = [];
    p([], 0);
    return result;
}

// Runs through all the permutations of tags in order to try and find a backup recommendation that has atleast one option for the user
function getBackupfilter(myCleanedAnswers){
  let newResults
  if (myCleanedAnswers.length == 3){
    let choices = getPermutations(myCleanedAnswers, 2)
    for (let res of choices){
      const temp = myObj.filter(product => product.tags.includes(res[0]) && product.tags.includes(res[1]));
      if (temp.length > 0){
        newResults = temp
        return newResults
      }
    }
  }
  if (myCleanedAnswers.length == 2){
    for (let item of myCleanedAnswers){
      const temp = myObj.filter(product => product.tags.includes(item));
      if (temp.length > 0){
        newResults = temp
        return newResults
      }
    }
  }
}

//	 Filters through the loaded products, using the users selections to filter down the products into a recommendation.
//   The products are wrapped in a link tag that adds the product to cart and takes them directly to checkout
function filterResults(){
    const cleanedAnswers = removeNoPref([answer1, answer2, answer3])
    let filteredResults = [];
    let count = 1;
    
    switch (cleanedAnswers.length){
      case 3:
        filteredResults = myObj.filter(product => product.tags.includes(cleanedAnswers[0]) && product.tags.includes(cleanedAnswers[1]) && product.tags.includes(cleanedAnswers[2]));
        break;
      case 2:
        filteredResults = myObj.filter(product => product.tags.includes(cleanedAnswers[0]) && product.tags.includes(cleanedAnswers[1]));
        break;
      case 1:
        filteredResults = myObj.filter(product => product.tags.includes(cleanedAnswers[0]));
        break;
    }
  
    //  Determines whether any suitable results were found, if not then a message is displayed and a second filtering is done. If there is a large list
    //  it is shortened to only show 5
    switch(true){
      case(filteredResults.length < 1):      
        filteredResults = getBackupfilter(cleanedAnswers)
        if (filteredResults.length === 1) {$('#wizard-slides-id').addClass("wizard-slides-center");}
        if (filteredResults.length > 5){filteredResults = filteredResults.slice(0, 5);}
        const noRes = `<div>Whilst we weren't able to find an exact match, based on your preferences you may like these options</div>`
        $('#wizard-recommendation').append(noRes);
        break;
      case(filteredResults.length < 2):
        $('#wizard-slides-id').addClass("wizard-slides-center");
        const Res1 = `<div>Based on your selection, this watch is the perfect style for you!</div>`
    	$('#wizard-recommendation').append(Res1);
        break;
      case(filteredResults.length < 6):
         const Res2 = `<div>Based on your selection, these watches align with your sense of style</div>`
    	$('#wizard-recommendation').append(Res2);
        break;
      case(filteredResults.length > 5):        
        filteredResults = filteredResults.slice(0, 5);
        const Res3 = `<div>Based on your selection, these watches align with your sense of style</div>`
    	$('#wizard-recommendation').append(Res3);
        break;
    } 
    
	//  Creates a product card for each option that links to its relevant checkout. A discount code is applied if one is provided. Each link is updated after recieving the relevant product id.
    filteredResults.forEach(product => {
      const template = createProductTemplate(product, count)
      $('#wizard-slides-id').append(template);
      let newProd = product.id
      count = count + 1;
      jQuery.getJSON(`/products/${product.handle}.js`, function(product) {
        let checkoutLink = document.getElementById(`${newProd}`)
        let completedLink = `https://royalswanwatches.myshopify.com/cart/${product.variants[0].id}:1?checkout&discount=${discountCode}`
        checkoutLinks.push(completedLink)
        checkoutLink.setAttribute('href', completedLink)
      	})
      })
   
  }

$(document).ready(function() {call()})
