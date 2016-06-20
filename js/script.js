$('#getNumbers').click(function() {
  $('#middle').html('<img src="style/img/loader.svg">');
  //let patt = /viaplay.se\/\w+\/[\w-]+/i;
  let patt = /viaplay.[sfdn][eoki]\/\w+\/[\w-]+/i;
  let match = $('#link').val().match(patt);

  if (match) {

    let domain = match[0].substring(8, 10);
    let link = match[0].substring(10, match[0].length);
    let getHTTP = 'https://content.viaplay.' + domain + '/pcdash-' + domain + link;

    $.get(getHTTP, function(data, status) {
      console.log(status);
      if (status != 'success') $('#middle').html('');
      // detect if movie or series
      if (data['_embedded']['viaplay:blocks']['0']['type'] == 'product') {
        
        let guid = data['_embedded']['viaplay:blocks'][0]['_embedded']['viaplay:product']['system']['guid'];

        $('#middle').html("<p class='movie_number'>" + guid + '</p>');

      } else {
        
        let season_num = data['_embedded']['viaplay:blocks'].length - 2;
        let season_arr = [];
        let count = 0;
        for (let num = 1; num <= season_num; num++) {

          let URL = getHTTP + '?seasonNumber=' + num;
          $.get(URL, function(data) {
            let blocks = data['_embedded']['viaplay:blocks'][1]['_embedded']['viaplay:products'];
            let content_numbers = '';
            let episodes = '';
            let i = 1;
            for (let key in blocks) {
              episodes += 'Episode ' + i + ':<br>';
              content_numbers += blocks[key].system.guid + '<br>';
              i++;
            }
            let title = '<div class="season-num">Season ' + num + '</div>';
            episodes = '<div class="episodes">' + episodes + '</div>';
            content_numbers = '<div class="numbers">' + content_numbers + '</div>';
            season_arr[num - 1] = '<div class="season">' + title + episodes + content_numbers + '</div>';
            count++;
            $('#middle').html('<img src="style/img/loader.svg">' + '<p class="movie_number">' + Math.round((count/season_num) * 100) + '%</p>');
            if (count == season_num) $('#middle').html(season_arr.join(''));
          });

        }
      }
    }).fail(function() {
      $('#middle').html("<p class='movie_number'>404 - page not found</p>");
    });
  } else $('#middle').html("<p class='movie_number'>Invalid link</p>");
});