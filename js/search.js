//global variables

var apiKey = "745504ff88308b0b9996317ef36076baebbd2c0d";//define global variable api key
var itemsToDisplay = 16; //we define the number of books we want per page

//functions
function search(){//function to load search for books
    
    window.location.href = "search.html?search=" + document.getElementById("searchText").value;
}

function keydown(){

    if (event.keyCode == 13 && (document.getElementById("searchText").value != '')) {//checks if user has pressed enter and search value not null
        event.preventDefault();//prevents same page reload upon pressing enter
        search();
    }

}

function getJSON(url, callback) {//make api request
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

function getBook(book, callback){

    //idreambooks.com does not provide the book cover image and returns a maximum of only 1 book per search result

    var searchText = "<div class=\"search-results\">Search results for: <span class=\"capitalize\">"+ book.searchText +"</span></div>"

    var image = "<div class=\"col-md-5 col-sm-12 col-xs-12\"><div class=\"book-image\">";

    image += "<img src=\"img/cover-not-found.jpg\" alt=\"book image\" class=\"img-responsive\" onerror=\"this.src='img/cover-not-found.jpg';\"></div></div>";
    
    var bookInfo = "<div class=\"col-md-7 col-sm-12 col-xs-12\"><div class=\"book-detail\"><div class=\"critic\">";
                                        
    if (book.to_read_or_not){//adding the read or not to read icon 
        bookInfo += "<img src=" + book.to_read_or_not+ " class=\"toreadornot\">";
    }
    if (book.rating){//adding the % for rating
        bookInfo += "<span class=\"percentage\">" + book.rating + "%</span>";
    }
    if (book.review_count){//if review available
        if (book.reviewCount > 1){//more than 1 review we write reviews instead of review
            bookInfo += "<div>" + book.review_count + " Critic Reviews</div>";
        }
        else{//1 review so we write review
             bookInfo += "<div>" + book.review_count + " Critic Review</div>";
        }
    }
    else{//no review
        bookInfo += "<div>No Critic Review</div>";
    }
    if (!book.rating && !book.to_read_or_not){//if nothing is available, we use the following classes to align the texts
        bookInfo += "<div class=\"toreadornot\"></div>";
        bookInfo += "<span class=\"percentage\"></span>";
    }

    bookInfo += "</div><div class=\"description\"><p class =\"book-name\">" + book.title + "</p><p class =\"book-author\">by " + book.author + "</p></div></div>";

    var bookContainerOpen = "<div class=\"col-xs-12 col-md-6 bootstrap\"><div class=\"book-content book-wrap clearfix\">";

    var bookContainerClose = "</div></div>"

    callback(searchText+bookContainerOpen+image+bookInfo+bookContainerClose);
}

function getSearchResults(){

    var query = location.search.substr(1);
    var result = {};
    query.split("&").forEach(function(part) {
        var item = part.split("=");
        result[item[0]] = decodeURIComponent(item[1]);
    });
    document.getElementById("searchText").value = result["search"];//add value to search bar

    //modifying the search parameters to match the api input.
    var q = result['search'];
    q = q.split(" ").join("+");

    //the api for book search returns only 1 book instead of a list of books 

    var url = "https://idreambooks.com/api/books/reviews.json?q=" + q + "&key=" + apiKey;

        getJSON(url,function(error, response){
        if (error != null) {
            console.log('Something went wrong: ' + err);
        } 
        else {
            var book = response.book;
            if (book.title == undefined){//if no book found
                var searchResults = "<div class=\"search-results\">\""+ result["search"] +"\" did not match any book.</div>"
                document.getElementById("searchResults").innerHTML += searchResults;
            }
            else{//display book found
                book.searchText = result["search"];
                getBook(book, function(val){
                                
                    document.getElementById("searchResults").innerHTML += val;//add the elements in ascending order

                });
            }
        }
    });
}

getSearchResults();
