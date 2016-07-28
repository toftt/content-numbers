var last_value = '';
var domain = 'se';
var selected = -1;
var results_up = true;
var no_of_links = 0;

$(document).click(function(event) { 
    if(!$(event.target).closest('#results').length) {
        if($('#results').is(":visible")) {
            $('#results').html('');
        }
    }
});

$('#link').bind("enterKey", function(e) {
  $('#getNumbers').click();
});

$('input').keyup(function(e) {
  if (e.keyCode == 13) {
    $(this).trigger("enterKey");
  }
});

$('html').keyup(function(e) {
	if ($('.link').length > 0) {
    if (e.keyCode == 40) {
      selectNext(1);
    }
    if (e.keyCode == 38) {
      selectNext(-1);
    }
    
    if (e.keyCode == 13 && selected > -1 && selected < no_of_links) {
    	getNumbers($('.link-a').attr('link'));
    }
  }
});

$('.domain').click(function() {
  if (!$(this).hasClass('chosen')) {
    $('.domain').removeClass('chosen');
    $(this).addClass('chosen');
  }
});

$('.button').click(function() {
  if (!$(this).hasClass('active')) {
    $('.button').toggleClass('active');
    if ($('#c_button').hasClass('active')) {
      $('#copy_paste').show();
      $('#search').hide();
    } else {
      $('#search').show();
      $('#copy_paste').hide();
    }
  }
});

$('#getNumbers').click(function() {
  getNumbers($('#link').val());
});
$('#search_field').keyup(searchContent);

function selectNext(dir) {
	if (results_up) {
  	if (selected === -1 && dir === 1) {
    	$('input').blur();
    	selected = 0;
      $('.link').eq(selected).addClass('link-a');
    } else if (selected + dir >= 0 && selected + dir < no_of_links){
    	selected += dir;
      $('.link').removeClass('link-a');
      $('.link').eq(selected).addClass('link-a');
    } else if(selected === 0 && dir === -1) {
    	$('#search_field').focus();
      selected = -1;
      $('.link').removeClass('link-a');
    }
  }
}

function getNumbers(link) {
	$('#results').html('');
  $('#search_field').val('');
  $('#search_field').focus();
  selected = -1;
  no_of_links = 0;
  $('#middle').html('<img src="style/img/loader.svg">' + '<p class="movie_number">0%</p>');
  let patt = /viaplay.[sfdn][eoki]\/\w+\/[\w-\.]+/i;
  let match = link.match(patt);

  if (match) {

    let domain = match[0].substring(8, 10);
    let link = match[0].substring(10, match[0].length);
    let getHTTP = 'https://content.viaplay.' + domain + '/pcdash-' + domain + link;

    $.get(getHTTP, function(data, status) {
      if (status != 'success') $('#middle').html('');
      // detect if movie or series
      if (data['_embedded']['viaplay:blocks']['0']['type'] == 'product') {

        let guid = data['_embedded']['viaplay:blocks'][0]['_embedded']['viaplay:product']['system']['guid'];

        $('#middle').html("<p class='movie_number'>" + guid + '</p>');
        $('.movie_number').OneClickSelect();
      } else {

        let season_num = data['_embedded']['viaplay:blocks'].length - 2;
        let season_arr = [];
        let avail_seasons = [];
        let count = 0;

        for (let j = 1; j <= season_num; j++) {
          avail_seasons.push(data['_embedded']['viaplay:blocks'][j]['title']);
        }

        for (let num = 0; num < season_num; num++) {

          let URL = getHTTP + '?seasonNumber=' + avail_seasons[num];
          $.get(URL, function(data) {
            let blocks = data['_embedded']['viaplay:blocks'][1]['_embedded']['viaplay:products'];
            let content_numbers = '';
            let episodes = '';
            let i = 1;
            for (let key in blocks) {
              episodes += '<span class="boxie">Episode ' + i + ':</span>';
              content_numbers += '<span class="num-boxie">' + blocks[key].system.guid + '</span>';
              i++;
            }
            let title = '<div class="season-num">Season ' + avail_seasons[num] + '</div>';
            episodes = '<div class="episodes">' + episodes + '</div>';
            content_numbers = '<div class="numbers">' + content_numbers + '</div>';
            season_arr[num] = '<div class="season">' + title + episodes + content_numbers + '</div>';
            count++;
            $('#middle').html('<img src="style/img/loader.svg">' + '<p class="movie_number">' + Math.round((count / season_num) * 100) + '%</p>');
            if (count == season_num) {
              $('#middle').html(season_arr.join(''));
              $('html, body').animate({
                scrollTop: $("#middle").offset().top
              }, 280);
              $('.num-boxie').OneClickSelect();
            }
          });

        }
      }
    }).fail(function() {
      $('#middle').html("<p class='movie_number'>404 - page not found</p>");
    });
  } else $('#middle').html("<p class='movie_number'>Invalid link</p>");
}

function searchContent() {
  selected = -1;
  domain = $('.chosen').attr("dom");
  if ($('#search_field').val() === '') $('#results').html('');
  if ($('#search_field').val() !== last_value && $('#search_field').val() !== '') {
    $('#results').html('');
    var URL = 'https://content.viaplay.' + domain + '/pcdash-' + domain + '/autocomplete?query=' + $('#search_field').val();
    $.get(URL, function(data) {
      if ('_embedded' in data['_embedded']['viaplay:blocks'][0]) {
        $('#results').html('');
        var results = data['_embedded']['viaplay:blocks'][0]['_embedded']['viaplay:products'];
        for (var result of results) {
          var title = '';
          if (result.type === 'movie') {
            title = result.content.title;
          } else if (result.type === 'series') title = result.content.series.title;
          var year = result.content.production.year;
          var path = result._links.self.href;
          path = path.replace('https://content.viaplay.' + domain + '/pcdash-' + domain, '');
          path = 'http://viaplay.' + domain + path.replace('?partial=true&block=1', '');
          $('#results').append('<div class="link" link="' + path + '">' + title + ' (' + year + ')</div>');
          if ($('#search_field').val() === '') $('#results').html('');
        }
        $('.link').click(function() {
          $('#results').html('')
          getNumbers($(this).attr('link'));
        });
        $('.link').hover(function() {
        	$('.link').removeClass('link-a');
          selected = $('.link').index(this);
        	$(this).toggleClass('link-a');
        });
        no_of_links = $('.link').length;
      }
    });
  }
  last_value = $('#search_field').val();
}

$.fn.OneClickSelect = function() {
  return $(this).on('click', function() {

    var range, selection;
    if (window.getSelection) {
      selection = window.getSelection();
      range = document.createRange();
      range.selectNodeContents(this);
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (document.body.createTextRange) {
      range = document.body.createTextRange();
      range.moveToElementText(this);
      range.select();
    }
  });
};
