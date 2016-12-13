// grab the articles as a json
$.getJSON('/articles', function(data) {
    
    for (var i = 0; i < data.length; i++) {
        
        $('#articles').append('<p data-id="' + data[i]._id + '">' + data[i].title + '<br />' + data[i].link + '</p><br>');
    }
});

//scrape button
$(document).on('click', '.scrape', function(){
    window.location = "../scrape";
});

// whenever someone clicks a p tag
$(document).on('click', 'p', function() {
    // empty the notes and comments
    $('#notes').empty();
    $('#comments').empty();
   
    var thisId = $(this).attr('data-id');

    // now make an ajax call 
    $.ajax({
            method: "GET",
            url: "/articles/" + thisId,
        })
        
        .done(function(data) {
            console.log(data);
            $('#notes').append('<h2>' + data.title + '</h2>');
            $('#notes').append('<textarea id="bodyinput1" name="body"></textarea><br>');
            $('#comments').append('<textarea id="bodyinput2" name="body"></textarea><br>');
            $('#comments').append('<button class="btn btn-success btn-lg" data-id="' + data._id + '" id="savenote">Save Comment</button>');
            $('#notes').append('<button class="btn btn-warning btn-lg" data-id="' + data._id + '" id="deletenote">Delete</button>');

            // if there's a input in the article
            if (data.input) {
                // place the body of the input in the body 
                $('#bodyinput1').val(data.input.body);
            }
        });
});

// when you click the savenote button makes post request
$(document).on('click', '#savenote', function() {
    
    var thisId = $(this).attr('data-id');

    // run a POST request to change 
    $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
                body: $('#bodyinput2').val()
            }
        })
        .done(function(data) {
            console.log(data);
            $('#comments').empty();
        });
    $('#bodyinput2').val("");
});

// Delete
$(document).on('click', '#deletenote', function() {
    var thisId = $(this).attr('data-id');
    $.ajax({
        method: "POST",
        url: '/delete/' + thisId,
    }).done(function(data){
        console.log(data);
        $('#notes').empty();
    });
});