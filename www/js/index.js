let db = null
let isDbReady = false

const SQL_CREATE_TRIP_DETAIL = 'CREATE TABLE IF NOT EXISTS user_trip(trip_id INTEGER PRIMARY KEY AUTOINCREMENT, trip_title TEXT NOT NULL, destination_name TEXT NOT NULL, trip_start_date DATE NOT NULL, risk_assessment_trip NOT NULL, emergency_contact TEXT, contactnum_relationship TEXT, trip_desc TEXT)';
const SQL_INSERT_NEW_TRIP = 'INSERT INTO user_trip(trip_title, destination_name, trip_start_date, risk_assessment_trip, emergency_contact, contactnum_relationship, trip_desc) VALUES (?, ?, ?, ?, ?, ?, ?)'
const SQL_SELECT_ALL_TRIP = 'SELECT trip_title,destination_name,trip_start_date FROM user_trip ORDER BY trip_title ASC';

function onSaveNewTripClicked() {
  if (!isDbReady) {
    showError('Database not ready. Please try again later.')
    return
  }
  let risk_assessment = $('input[name="riskoptions"]:checked').val().trim();
  // get input from UI
  let title = $.trim($('#trip-title-text').val())
  let destination = $.trim($('#destination-text').val())
  let start_date = $.trim($('#date-start-text').val())
  let emergency_contact = $.trim($('#emergency-contact-text').val())
  let contactnum_relationship = $.trim($('#contact-relationship-text').val())
  let desc = $.trim($('#desc-text').val())

  // ensure input is validated
  // show error if it is not
  if (title === '' || destination === '' || start_date === '' || risk_assessment === '') {
    showError("Fill in the required field.")
    return
  }
  db.transaction(
    function (tx) {
      tx.executeSql(
        SQL_INSERT_NEW_TRIP,
        [title, destination, start_date, risk_assessment, emergency_contact, contactnum_relationship, desc],
        function (tx, result) {
          $('#trip-title-text').val('')
          $('#destination-text').val('')
          $('#date-start-text').val('')
          $('#emergency-contact-text').val('')
          $('#contact-relationship-text').val('')
          $('#desc-text').val('')
        },
        function (tx, error) { showError('Failed to add trip.') }
      )
    },
    function (error) { },
    function () { }
  )
}

function onShowAllTrip() {
  if (!isDbReady) {
    showError('Database not ready. Please try again later.')
    return
  }

  db.transaction(
    function (tx) {
      tx.executeSql(
        SQL_SELECT_ALL_TRIP,
        [],
        function (tx, result) {
          for (let index = 0; index < result.rows.length; index++) {

            // Create the card element
            var card = $('<div>', {
              'class': 'card card-trip-app mx-3 my-4 position-relative'
            });

            // Create the card header element and add it to the card
            var cardHeader = $('<div>', {
              'class': 'card-header'
            }).append($('<span>').text(`${result.rows.item(index).trip_title}`));
            card.append(cardHeader);

            // Create the card body element and add it to the card
            var cardBody = $('<div>', {
              'class': 'card-body'
            });
            card.append(cardBody);

            // Create the blockquote element and add it to the card body
            var blockquote = $('<blockquote>', {
              'class': 'blockquote mb-0'
            }).append($('<p>').text(`Destination: ${result.rows.item(index).destination_name}`))
              .append($('<footer>', {
                'class': 'blockquote-footer'
              }).text(`Date Start: ${result.rows.item(index).trip_start_date}`));
            cardBody.append(blockquote);

            // Create the link element and add its to the card body
            var link = $('<a>', {
              'href': 'edit_trip.html',
              'class': 'stretched-link btn-app'
            });
            cardBody.append(link);

            // Append the card to the card container element
            $('#cardContainer').append(card);



          }
        },
        function (tx, error) { showError('Failed to retrieve trip.') }
      )
    },
    function (error) { },
    function () { }
  )
}

function showError(message) {
  navigator.vibrate(2000)
  navigator.notification.beep(1)
  navigator.notification.alert(message, null, 'Error', 'OK')
}

document.addEventListener('deviceready', function () {
  Zepto(function ($) {
    $('#add-user-trip').on('click', onSaveNewTripClicked)
    db = window.sqlitePlugin.openDatabase(
      { 'name': 'm_expense.db', 'location': 'default' },
      function (database) { // SUCCESS callback
        db = database
        db.transaction(
          function (tx) {
            tx.executeSql(
              SQL_CREATE_TRIP_DETAIL,
              [],
              function (tx, result) {
                isDbReady = true
                console.log('SQL_CREATE_TRIP_DETAIL', 'OK')
                onShowAllTrip()
              }, // SUCCESS callback
              function (tx, error) {
                isDbReady = false
                console.log('SQL_CREATE_TRIP_DETAIL ERROR', error.message)
              } // ERROR callback
            )
          },
          function (error) { isDbReady = false }, // ERROR callback
          function () { } // SUCCESS callback
        )
      },
      function (error) { }
    )
  })
}, false)
