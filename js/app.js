//global variables

var apiKey = "745504ff88308b0b9996317ef36076baebbd2c0d";//define global variable api key
var itemsToDisplay = 8; //we define the number of books we want per page

//functions

(function($) {
    "use strict"; // Start of use strict

    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $(document).on('click', 'a.page-scroll', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: ($($anchor.attr('href')).offset().top - 50)
        }, 1250, 'easeInOutExpo');
        event.preventDefault();
    });

    // Highlight the top nav as scrolling occurs
    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 100
    });

    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function() {
        $('.navbar-toggle:visible').click();
    });

    // Offset for Main Navigation
    $('#mainNav').affix({
        offset: {
            top: 50
        }
    })

})(jQuery); // End of use strict

function keydown(){
    if (event.keyCode == 13 && (document.getElementById("searchText").value != '')) {//checks if user has pressed enter and search value not null
        event.preventDefault();//prevents same page reload upon pressing enter
        search();
    }
}

function search(){//function to redirect search for books

    window.location.href = "search.html?search=" + document.getElementById("searchText").value;
}

function getJSON(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status == 200) {
        callback(null, xhr.response);
      } else {
        callback(status);
      }
    };
    xhr.send();
};

function getBook(book, rank, callback){

    //this function is for generating the appropriate html codes for displaying book information
    /*since the api does not provide us the book cover image, we will try to retrieve the image from another website using the isbn
    however the issue is that idreambooks.com does not provide only 1 isbn and provide several isbn and some do not match those found on other websites.
    we will display image not found if the first isbn provided by idreambooks is not available on other websites*/

    var image = "<div class=\"col-md-5 col-sm-12 col-xs-12\"><div class=\"book-image\">";

    image += "<img src=\"https://pictures.abebooks.com/isbn/" + book.isbn + "-us.jpg\" alt=\"book image\" class=\"img-responsive\" onerror=\"this.src='img/cover-not-found.jpg';\"></div></div>";
    
    var bookInfo = "<div class=\"col-md-7 col-sm-12 col-xs-12\"><div class=\"book-detail\"><span class=\"rank\">" + rank + "</span><div class=\"critic\">";
                                        
    if (book.readIcon){//adding the read or not to read icon 
        bookInfo += "<img src=" + book.readIcon+ " class=\"toreadornot\">";
    }
    if (book.rating){//adding the % for rating
        bookInfo += "<span class=\"percentage\">" + book.rating + "%</span>";
    }
    if (book.reviewCount){//if review available
        if (book.reviewCount > 1){//more than 1 review we write reviews instead of review
            bookInfo += "<div>" + book.reviewCount + " Critic Reviews</div>";
        }
        else{//1 review so we write review
             bookInfo += "<div>" + book.reviewCount + " Critic Review</div>";
        }
    }
    else{//no review
        bookInfo += "<div>No Critic Review</div>";
    }
    if (!book.rating && !book.readIcon){//if nothing is available, we use the following classes to align the texts
        bookInfo += "<div class=\"toreadornot\"></div>";
        bookInfo += "<span class=\"percentage\"></span>";
    }

    bookInfo += "</div><div class=\"description\"><p class =\"book-name\">" + book.title + "</p><p class =\"book-author\">by " + book.author + "</p></div></div>";

    var bookContainerOpen = "<div class=\"col-xs-12 col-md-6 bootstrap\"><div class=\"book-content book-wrap clearfix\">";

    var bookContainerClose = "</div></div>"

    callback(bookContainerOpen+image+bookInfo+bookContainerClose);
}



function getBooksByGenre(url,elementId){
    //this function is for making api request for books by genre
    getJSON(url,function(err, response) {

        if (err != null) {
            console.log('Something went wrong: ' + err);
        } 
        else {
            
            var books = response.slice(0, itemsToDisplay); //we will not display all the books, we will display the first n books only
            var itemsProcessed = 0; //variable to track if all items have been processed since it's being done asynchronously
            var elementsArr = new Array(); //an empty array to store the html codes for each book
            books.forEach(function(book, index){

                var isbns = book.isbns;//retrieve the string of isbns
                isbns = isbns.split(",");//convert the string to an array
                book.isbn = isbns[0];//set the isbn value to the string

                /*since the api does not provide information about rating and some of the other required information, we would have
                to make another api for each of these books to retrieve the information*/

                var url = "https://idreambooks.com/api/books/reviews.json?q=" + book.isbn + "&key=" + apiKey; 
                
                getJSON(url,function(error, response){
                    if (err != null) {
                        console.log('Something went wrong: ' + err);
                    } 
                    else {
                        book.reviewCount = response.book.review_count;
                        book.rating = response.book.rating;
                        book.readIcon = response.book.to_read_or_not;
                        getBook(book, index+1, function(val){
                            elementsArr[index] = val;
                            
                            itemsProcessed += 1;//using a counter to verify the number of items processed since it's processing it asynchronously
                            
                            if (itemsProcessed == itemsToDisplay){//once everything has been processed, we will add the html codes, because if we add it instantly as soon as each is processed, they will not be in the correct order due to asynchronous processing
                                elementsArr.forEach(function(item, index){
                                    document.getElementById(elementId).innerHTML += item;//add the elements in ascending order
                                });//end foreach
                            }//end if
                        });
                    }
                });
            });
        }
    });
}

function getFiction() {

    var genre = "fiction";//set movie genre
    var url = "http://idreambooks.com/api/publications/recent_recos.json?key=" + apiKey + "&slug=" + genre;
    getBooksByGenre(url,"1");
    
};
function getNonFiction() {

    var genre = "non-fiction";//set movie genre
    var url = "http://idreambooks.com/api/publications/recent_recos.json?key=" + apiKey + "&slug=" + genre;
    getBooksByGenre(url,"2");
};
function getBestSellers() {

    var genre = "bestsellers";//set movie genre
    var url = "http://idreambooks.com/api/publications/recent_recos.json?key=" + apiKey + "&slug=" + genre;
    getBooksByGenre(url,"3");//function to retrieve the list of books
    
};
