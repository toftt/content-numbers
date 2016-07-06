$('input').bind("enterKey", function(e) {
  $('#getNumbers').click();
});
$('input').keyup(function(e) {
  if (e.keyCode == 13) {
    $(this).trigger("enterKey");
  }
});

$('#getNumbers').click(function() {
  $('#middle').html('<img src="style/img/loader.svg">' + '<p class="movie_number">0%</p>');
  //let patt = /viaplay.se\/\w+\/[\w-]+/i;
  let patt = /viaplay.[sfdn][eoki]\/\w+\/[\w-.]+/i;
  let match = $('#link').val().match(patt);

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
              content_numbers += '<span class="num-boxie">' + blocks[key].system.guid + '</span><br>';
              i++;
            }
            let title = '<div class="season-num">Season ' + avail_seasons[num] + '</div>';
            episodes = '<div class="episodes">' + episodes + '</div>';
            content_numbers = '<div class="numbers">' + content_numbers + '</div>';
            season_arr[num] = '<div class="season">' + title + episodes + content_numbers + '</div>';
            count++;
            $('#middle').html('<img src="style/img/loader.svg">' + '<p class="movie_number">' + Math.round((count/season_num) * 100) + '%</p>');
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
});

$.fn.OneClickSelect = function(){
  return $(this).on('click',function(){
    
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
