let db = null
let isDbReady = false

const SQL_CREATE_TRIP_DETAIL = 'CREATE TABLE IF NOT EXISTS user_trip(trip_id INTEGER PRIMARY KEY AUTOINCREMENT, trip_title TEXT NOT NULL, destination_name TEXT NOT NULL, trip_start_date DATE NOT NULL, risk_assessment_trip NOT NULL, emergency_contact TEXT, contactnum_relationship TEXT, trip_desc TEXT)';
const SQL_INSERT_NEW_TRIP = 'INSERT INTO user_trip(trip_title, destination_name, trip_start_date, risk_assessment_trip, emergency_contact, contactnum_relationship, trip_desc) VALUES (?, ?, ?, ?, ?, ?, ?)'
const SQL_SELECT_ALL_TRIP = 'SELECT trip_id,trip_title,destination_name,trip_start_date FROM user_trip ORDER BY trip_title ASC';
const SQL_DELETE_ALL_TRIP = 'DELETE FROM user_trip'
const SQL_SELECT_TWO_TRIP = 'SELECT trip_id, trip_title,destination_name,trip_start_date FROM user_trip ORDER BY trip_start_date ASC LIMIT 2'
const SQL_RESET_USER_ID = 'DELETE FROM sqlite_sequence WHERE name=`user_trip`'
const SQL_SELECT_ONE_TRIP = 'SELECT trip_title,destination_name,trip_start_date, risk_assessment_trip, emergency_contact, contactnum_relationship, trip_desc FROM user_trip WHERE trip_id=?';
const SQL_DELETE_ONE_TRIP = 'DELETE FROM user_trip WHERE trip_id = ?'
const SQL_UDDATE_ONE_TRIP = 'UPDATE user_trip SET trip_title=?, destination_name=?, trip_start_date=?, risk_assessment_trip=?, emergency_contact=?, contactnum_relationship=?, trip_desc=? WHERE trip_id=?'


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
            // <div class="card card-trip-app mx-3 my-4 position-relative">
            //   <div class="card-header">
            //     <span>Trip Name</span>
            //     <input type="hidden" name="test" value="tripid"></input>
            //   </div>
            //   <div class="card-body">
            //     <blockquote class="blockquote mb-0">
            //       <p>Destination: Johor, Malaysia</p>
            //       <footer class="blockquote-footer">Date Start: 12 Apr 23</footer>
            //     </blockquote>
            //     <a href="edit_trip.html" class="stretched-link btn-app"></a>
            //   </div>
            // </div>
            // Create the card element
            var card = $('<div>', {
              'class': 'card card-trip-app mx-3 my-4 position-relative'
            });

            // Create the card header element and add it to the card
            var cardHeader = $('<div>', {
              'class': 'card-header'
            }).append($('<span>').text(`${result.rows.item(index).trip_title}`))
              .append($('<input>', {
                'type': 'hidden',
                'id': 'test',
                'value': `${result.rows.item(index).trip_id}`
              }));
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
            var button = $('<button>', {
              'class': 'stretched-link hidden-btn-app'
            }).on('click', function () {
              sessionStorage.setItem('tripid', `${result.rows.item(index).trip_id}`);
              window.open("edit_trip.html");
            });

            cardBody.append(button);

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

function onDeleteTrip() {
  if (!isDbReady) {
    showError('Database not ready. Please try again later')
    return
  }

  var trip_id_get = sessionStorage.getItem("tripid");
  db.transaction(
    function (tx) {
      tx.executeSql(
        SQL_DELETE_ONE_TRIP,
        [trip_id_get],
        function (tx, result) { //clear ui
          onShowAllTrip()
          history.back();
        },
        function (tx, error) { showError('Failed to delete trip.') }
      )
    },
    function (error) { },
    function () { }
  )
}

function onUpdateTrip() {
  if (!isDbReady) {
    showError('Database not ready. Please try again later')
    return
  }
  let edit_risk_assessment = $('input[name="editriskoptions"]:checked').val().trim();
  // get input from UI
  let edit_title = $.trim($('#edit-trip-title-text').val())
  let edit_destination = $.trim($('#edit-destination-text').val())
  let edit_start_date = $.trim($('#edit-date-start-text').val())
  let edit_emergency_contact = $.trim($('#edit-emergency-contact-text').val())
  let edit_contactnum_relationship = $.trim($('#edit-contact-relationship-text').val())
  let edit_desc = $.trim($('#edit-desc-text').val())
  var trip_id_get = sessionStorage.getItem("tripid");
  if (edit_title === '' || edit_destination === '' || edit_start_date === '' || edit_risk_assessment === '') {
    showError("Fill in the required field.")
    return
  }

  db.transaction(
    function (tx) {
      tx.executeSql(
        SQL_UDDATE_ONE_TRIP,
        [edit_title, edit_destination, edit_start_date, edit_risk_assessment, edit_emergency_contact, edit_contactnum_relationship, edit_desc, trip_id_get],
        function (tx, result) { //clear ui
          onShowAllTrip()
          history.back();
        },
        function (tx, error) { showError('Failed to update trip.') }
      )
    },
    function (error) { },
    function () { }
  )
}

function onShowDetailTrip() {
  if (!isDbReady) {
    showError('Database not ready. Please try again later.')
    return
  }

  var trip_id_get = sessionStorage.getItem("tripid");
  db.transaction(
    function (tx) {
      tx.executeSql(
        SQL_SELECT_ONE_TRIP,
        [trip_id_get],
        function (tx, result) {
          if (result.rows.length > 0) {
            $('#edit-trip-title-text').val(`${result.rows.item(0).trip_title}`)
            $('#edit-destination-text').val(`${result.rows.item(0).destination_name}`)
            $('#edit-date-start-text').val(`${result.rows.item(0).trip_start_date}`)
            $('#edit-emergency-contact-text').val(`${result.rows.item(0).emergency_contact}`)
            $('#edit-contact-relationship-text').val(`${result.rows.item(0).contactnum_relationship}`)
            $('#edit-desc-text').val(`${result.rows.item(0).trip_desc}`)

            $('#get_trip_title').text(`${result.rows.item(0).trip_title}`)
            $('#get_destination').text(`Destination: ${result.rows.item(0).destination_name}`)
            $('#get_risk_assesment').text(`Risk Assesment: ${result.rows.item(0).risk_assessment_trip}`)
            $('#get_emergency_contact').text(`Emergency Contact: ${result.rows.item(0).emergency_contact}`)
            $('#get_contact_relationship').text(` (${result.rows.item(0).contactnum_relationship})`)
            $('#get_desc').text(`Description: ${result.rows.item(0).trip_desc}`)
            $('#get_date_start').text(`Date Start: ${result.rows.item(0).trip_start_date}`)
          }

        },
        function (tx, error) { showError('Failed to show trip detail.') }
      )
    },
    function (error) { },
    function () { }
  )
}


function onResetUserId() {
  if (!isDbReady) {
    showError('Database not ready. Please try again later')
    return
  }

  db.transaction(
    function (tx) {
      tx.executeSql(
        SQL_RESET_USER_ID,
        [],
        function (tx, result) { //clear ui

          onShowAllTrip()
        },
        function (tx, error) { showError('Failed to reset id.') }
      )
    },
    function (error) { },
    function () { }
  )
}

function onDeleteAllTrip() {
  if (!isDbReady) {
    showError('Database not ready. Please try again later')
    return
  }

  db.transaction(
    function (tx) {
      tx.executeSql(
        SQL_DELETE_ALL_TRIP,
        [],
        function (tx, result) { //clear ui
          onResetUserId()
          onShowAllTrip()
          history.back();
        },
        function (tx, error) { showError('Failed to delete all trip.') }
      )
    },
    function (error) { },
    function () { }
  )
}


function onShowTwoTrip() {
  if (!isDbReady) {
    showError('Database not ready. Please try again later.')
    return
  }

  db.transaction(
    function (tx) {
      tx.executeSql(
        SQL_SELECT_TWO_TRIP,
        [],
        function (tx, result) {
          if (result.rows.length > 0) {
            for (let index = 0; index < result.rows.length; index++) {
              var card = $('<div>', {
                'class': 'card card-trip-app mx-3 my-4 position-relative'
              });
  
              // Create the card header element and add it to the card
              var cardHeader = $('<div>', {
                'class': 'card-header'
              }).append($('<span>').text(`${result.rows.item(index).trip_title}`))
                .append($('<input>', {
                  'type': 'hidden',
                  'id': 'test',
                  'value': `${result.rows.item(index).trip_id}`
                }));
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
              var button = $('<button>', {
                'class': 'stretched-link hidden-btn-app'
              }).on('click', function () {
                sessionStorage.setItem('tripid', `${result.rows.item(index).trip_id}`);
                window.open("edit_trip.html");
              });
  
              cardBody.append(button);

              // Append the card to the card container element
              $('#cardTwoContainer').append(card);
            }
            var card = $('<div>', {
              'class': 'card card-trip-app mx-3 my-4 position-relative'
            });

            // Create the card header element and add it to the card
            var cardHeader = $('<div>', {
              'class': 'card-header'
            }).append($('<span>').text(`${result.rows.item(index).trip_title}`))
              .append($('<input>', {
                'type': 'hidden',
                'id': 'test',
                'value': `${result.rows.item(index).trip_id}`
              }));
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
            var button = $('<button>', {
              'class': 'stretched-link hidden-btn-app'
            }).on('click', function () {
              sessionStorage.setItem('tripid', `${result.rows.item(index).trip_id}`);
              window.open("edit_trip.html");
            });

            cardBody.append(button);

            // Append the card to the card container element
            $('#cardTwoContainer').append(card);
          }
          else {
            var card = $('<div>', {
              'class': 'card card-trip-app mx-3 my-4 position-relative'
            });

            // Create the card header element and add it to the card
            var cardHeader = $('<div>', {
              'class': 'card-header'
            }).append($('<span>').text(`No Trip Added`))
              .append($('<input>', {
                'type': 'hidden',
                'id': 'notfound',
                'value': `-`
              }));
            card.append(cardHeader);

            // Create the card body element and add it to the card
            var cardBody = $('<div>', {
              'class': 'card-body'
            });
            card.append(cardBody);

            // Create the blockquote element and add it to the card body
            var blockquote = $('<blockquote>', {
              'class': 'blockquote mb-0'
            }).append($('<p>').text(`Destination: -`))
              .append($('<footer>', {
                'class': 'blockquote-footer'
              }).text(`Date Start: -`));
            cardBody.append(blockquote);

            // Create the link element and add its to the card body
            var button = $('<button>', {
              'class': 'stretched-link hidden-btn-app'
            }).on('click', function () {
              sessionStorage.setItem('tripid', `-`);
              window.open("edit_trip.html");
            });

            cardBody.append(button);

            // Append the card to the card container element
            $('#cardTwoContainer').append(card);
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
    $('#edit-user-trip').on('click', onUpdateTrip)
    $('#delete-user-trip').on('click', onDeleteTrip)
    $('#delete-all-user-trip').on('click', onDeleteAllTrip)
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
                onShowDetailTrip()
                onShowTwoTrip()
                var sessionValue = sessionStorage.getItem("tripid");

                // Set the value of the input element with ID "get_id"
                $("#get_trip_id").val(sessionValue);
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
