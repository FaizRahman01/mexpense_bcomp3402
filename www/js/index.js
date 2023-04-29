let db = null
let isDbReady = false

const SQL_CREATE_TRIP_DETAIL = 'CREATE TABLE IF NOT EXISTS user_trip(trip_id INTEGER PRIMARY KEY AUTOINCREMENT, trip_title TEXT NOT NULL, destination_name TEXT NOT NULL, trip_start_date DATE NOT NULL, risk_assessment_trip TEXT NOT NULL, emergency_contact TEXT, contactnum_relationship TEXT, trip_desc TEXT)';
const SQL_INSERT_NEW_TRIP = 'INSERT INTO user_trip(trip_title, destination_name, trip_start_date, risk_assessment_trip, emergency_contact, contactnum_relationship, trip_desc) VALUES (?, ?, ?, ?, ?, ?, ?)'
const SQL_SELECT_ALL_TRIP = 'SELECT trip_id,trip_title,destination_name,trip_start_date FROM user_trip ORDER BY trip_title ASC';
const SQL_SELECT_SEARCH_ALL = 'SELECT trip_id,trip_title,destination_name,trip_start_date FROM user_trip WHERE trip_title LIKE ? OR destination_name LIKE ? OR trip_start_date LIKE ? ORDER BY trip_title ASC ';
const SQL_SELECT_SEARCH_TRIPTITLE = 'SELECT trip_id,trip_title,destination_name,trip_start_date FROM user_trip WHERE trip_title LIKE ? ORDER BY trip_title ASC ';
const SQL_SELECT_SEARCH_DESTINATION = 'SELECT trip_id,trip_title,destination_name,trip_start_date FROM user_trip WHERE destination_name LIKE ? ORDER BY trip_title ASC ';
const SQL_SELECT_SEARCH_START_DATE = 'SELECT trip_id,trip_title,destination_name,trip_start_date FROM user_trip WHERE trip_start_date LIKE ? ORDER BY trip_start_date ASC ';
const SQL_DELETE_ALL_TRIP = 'DELETE FROM user_trip'
const SQL_SELECT_TWO_TRIP = 'SELECT trip_id, trip_title,destination_name,trip_start_date FROM user_trip ORDER BY trip_start_date ASC LIMIT 2'
const SQL_SELECT_ONE_TRIP = 'SELECT trip_title,destination_name,trip_start_date, risk_assessment_trip, emergency_contact, contactnum_relationship, trip_desc FROM user_trip WHERE trip_id=?';
const SQL_DELETE_ONE_TRIP = 'DELETE FROM user_trip WHERE trip_id = ?'
const SQL_UPDATE_ONE_TRIP = 'UPDATE user_trip SET trip_title=?, destination_name=?, trip_start_date=?, risk_assessment_trip=?, emergency_contact=?, contactnum_relationship=?, trip_desc=? WHERE trip_id=?'

const SQL_CREATE_EXPENSES_DETAIL = 'CREATE TABLE IF NOT EXISTS user_expenses(expense_id INTEGER PRIMARY KEY AUTOINCREMENT, trip_id INTEGER NOT NULL, expense_type TEXT NOT NULL, money_spent REAL NOT NULL, time_record TEXT NOT NULL, comment_expense TEXT, FOREIGN KEY (trip_id) REFERENCES user_trip(trip_id) ON DELETE CASCADE)';
const SQL_INSERT_NEW_EXPENSES = 'INSERT INTO user_expenses(trip_id, expense_type, money_spent, time_record, comment_expense) VALUES (?, ?, ?, ?, ?)'
const SQL_SELECT_ALL_EXPENSES = 'SELECT * FROM user_expenses WHERE trip_id = ? ORDER BY time_record DESC';
const SQL_SELECT_ONE_EXPENSES = 'SELECT * FROM user_expenses WHERE trip_id = ? AND expense_id = ?';
const SQL_DELETE_ONE_EXPENSES = 'DELETE FROM user_expenses WHERE trip_id = ? AND expense_id = ?'
const SQL_UPDATE_ONE_EXPENSES = 'UPDATE user_expenses SET expense_type=?, money_spent=?, time_record=?, comment_expense=? WHERE trip_id = ? AND expense_id = ?'
const SQL_SELECT_TOTAL_EXPENSES = 'SELECT SUM(money_spent) AS result_expenses FROM user_expenses WHERE trip_id = ?;';

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
  else if (!isFinite(emergency_contact) || isNaN(parseFloat(emergency_contact)) && emergency_contact !== "") {
    showError("Use number only for emergency contact number")
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
  else if (!isFinite(edit_emergency_contact) || isNaN(parseFloat(edit_emergency_contact)) && emergency_contact !== "") {
    showError("Use number only for emergency contact number")
    return
  }

  db.transaction(
    function (tx) {
      tx.executeSql(
        SQL_UPDATE_ONE_TRIP,
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
        function (tx, result) {
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


function onShowSearchResult(tripkeyword,searchcategory) {
  if (!isDbReady) {
    showError('Database not ready. Please try again later.')
    return
  }

  let SQL_SELECT_SEARCH = '';
  if(searchcategory === 'search-trip'){
    SQL_SELECT_SEARCH  = SQL_SELECT_SEARCH_TRIPTITLE;
  }
  else if(searchcategory === 'search-destination') {
    SQL_SELECT_SEARCH  = SQL_SELECT_SEARCH_DESTINATION;
  }
  else if(searchcategory === 'search-date-start') {
    SQL_SELECT_SEARCH  = SQL_SELECT_SEARCH_START_DATE;
  }
  else{
    SQL_SELECT_SEARCH  = SQL_SELECT_SEARCH_ALL;
  }
  if(tripkeyword && tripkeyword.trim() !== '' 
  && searchcategory === 'search-trip' 
  || searchcategory === 'search-destination' 
  || searchcategory === 'search-date-start') {
    db.transaction(
      function (tx) {
        tx.executeSql(
          SQL_SELECT_SEARCH,
          [tripkeyword + '%'],
          function (tx, result) {
            $('#cardContainer').empty();
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
          function (tx, error) { showError('Failed to search selected categoy.') }
        )
      },
      function (error) { },
      function () { }
    )
  }
  else if (tripkeyword && tripkeyword.trim() !== '') {
    db.transaction(
      function (tx) {
        tx.executeSql(
          SQL_SELECT_SEARCH,
          [tripkeyword + '%', tripkeyword + '%', tripkeyword + '%'],
          function (tx, result) {
            $('#cardContainer').empty();
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
          function (tx, error) { showError('Failed to search all category.') }
        )
      },
      function (error) { },
      function () { }
    )
  }
  else{
    onShowAllTrip()
  }
}


//expenses

function onSaveNewExpensesClicked() {
  if (!isDbReady) {
    showError('Database not ready. Please try again later.')
    return
  }
  // get input from UI
  let type = $.trim($('#text-expense-type').val())
  let amount_spent = $.trim($('#text-amount-expense').val())
  let current_timedate = $.trim($('#add-expensesdatetime').val())
  let comment = $.trim($('#text-comment').val())

  var trip_id_get = sessionStorage.getItem("tripid");
  // ensure input is validated
  // show error if it is not
  if (type === '' || amount_spent === '' || current_timedate === '') {
    showError("Fill in the required field.")
    return
  }
  else if (!isFinite(amount_spent) || isNaN(parseFloat(amount_spent))) {
    showError("Can use number and dot symbol only")
    return
  }
  db.transaction(
    function (tx) {
      tx.executeSql(
        SQL_INSERT_NEW_EXPENSES,
        [trip_id_get, type, amount_spent, current_timedate, comment],
        function (tx, result) {
          $('#text-expense-type').val('')
          $('#text-amount-expense').val('')
          $('#add-expensesdatetime').val('')
          $('#text-comment').val('')

          history.back();

        },
        function (tx, error) { showError('Failed to add expenses.') }
      )
    },
    function (error) { },
    function () { }
  )
}

function onShowTotalExpenses() {
  if (!isDbReady) {
    showError('Database not ready. Please try again later.')
    return
  }

  var trip_id_get = sessionStorage.getItem("tripid");
  db.transaction(
    function (tx) {
      tx.executeSql(
        SQL_SELECT_TOTAL_EXPENSES,
        [trip_id_get],
        function (tx, result) {
          if (result.rows.length > 0) {
            total_count_expense = result.rows.item(0).result_expenses
            var show_expense = total_count_expense.toFixed(2);
            $('#text-total-expenses').text(show_expense)
          }

        },
        function (tx, error) { showError('Failed to show trip detail.') }
      )
    },
    function (error) { },
    function () { }
  )
}

function onShowAllExpenses() {
  if (!isDbReady) {
    showError('Database not ready. Please try again later.')
    return
  }
  var trip_id_get = sessionStorage.getItem("tripid");
  db.transaction(
    function (tx) {
      tx.executeSql(
        SQL_SELECT_ALL_EXPENSES,
        [trip_id_get],
        function (tx, result) {
          //               <div class="card  my-3 mx-3">
          //     <div class="card-body">

          //         <div class="container">
          //             <div class="row">
          //                 <div class="col-8">
          //                     <p class="card-text text-sm-start">${result.rows.item(index).expense_type}</p>
          //                     <p class="card-text text-sm-start">Amount spent: <span>${result.rows.item(index).money_spent}</span>$</p>
          //                     <p class="card-text text-sm-start mb-4">Comment: ${result.rows.item(index).comment_expense}</p>
          //                     <footer class="blockquote-footer" id="get_date_start">${result.rows.item(index).time_record}</footer>
          //                 </div>


          //                 <div class="col-4 my-2 text-sm-end text-center align-items-center">
          //                     <button type="button" data-bs-toggle="modal" data-bs-target="#EditExpensesModal"
          //                         class="main-btn-app rounded-4 btn-app">
          //                         <span>
          //                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 14 14">
          //                                 <g fill="none" stroke="#e6ebeb" stroke-linecap="round" stroke-linejoin="round">
          //                                     <path
          //                                         d="m7.5 9l-3 .54L5 6.5L10.73.79a1 1 0 0 1 1.42 0l1.06 1.06a1 1 0 0 1 0 1.42Z" />
          //                                     <path d="M12 9.5v3a1 1 0 0 1-1 1H1.5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3" />
          //                                 </g>
          //                             </svg>
          //                         </span>
          //                         Edit
          //                     </button>
          //                 </div>

          //             </div>
          //         </div>


          //     </div>
          // </div>         
          for (let index = 0; index < result.rows.length; index++) {
            // create a div element with class "hahe abc heho"
            // Create the card element
            // Create a new button element with the given attributes
            // create a new card element
            var card = $('<div>').addClass('card my-3 mx-3');

            // create card body element
            var cardBody = $('<div>').addClass('card-body');

            // create container element
            var container = $('<div>').addClass('container');

            // create row element
            var row = $('<div>').addClass('row');

            // create column for card content
            var contentCol = $('<div>').addClass('col-8');

            // add card content
            contentCol.append($('<p>').addClass('card-text text-sm-start').text(`${result.rows.item(index).expense_type}`));
            contentCol.append($('<p>').addClass('card-text text-sm-start').text(`Amount: `).append($('<span>').text(`${result.rows.item(index).money_spent}`)).append('$'));
            contentCol.append($('<p>').addClass('card-text text-sm-start mb-4').text(`${result.rows.item(index).comment_expense}`));
            contentCol.append($('<footer>').addClass('blockquote-footer').attr('id', 'get_date_start').text(`${result.rows.item(index).time_record}`));

            // create column for settings button
            var btnCol = $('<div>').addClass('col-4 my-2 text-sm-end text-center align-items-center');

            // create settings button
            var settingsBtn = $('<button>').addClass('main-btn-app rounded-4 btn-app').on('click', function () {
              sessionStorage.setItem('expenseid', `${result.rows.item(index).expense_id}`);
              onShowDetailExpenses()
            }).attr({
              'type': 'button',
              'data-bs-toggle': 'modal',
              'data-bs-target': '#EditExpensesModal'
            }).html(`<span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 14 14"><g fill="none" stroke="#e6ebeb" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 9l-3 .54L5 6.5L10.73.79a1 1 0 0 1 1.42 0l1.06 1.06a1 1 0 0 1 0 1.42Z" /><path d="M12 9.5v3a1 1 0 0 1-1 1H1.5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3" /></g></svg></span>Edit`);

            // append settings button to column
            btnCol.append(settingsBtn);

            // append content and button columns to row
            row.append(contentCol).append(btnCol);

            // append row to container
            container.append(row);

            // append container to card body
            cardBody.append(container);

            // append card body to card
            card.append(cardBody);


            // Append the card to the main container
            $('#CardExpensesContainer').append(card);



          }
          
        },
        function (tx, error) { showError('Failed to show expenses.') }
      )
    },
    function (error) { },
    function () { }
  )
}

function onUpdateExpenses() {
  if (!isDbReady) {
    showError('Database not ready. Please try again later')
    return
  }
  // get input from UI
  let type = $.trim($('#edit-text-expense-type').val())
  let amount_spent = $.trim($('#edit-text-amount-expense').val())
  let current_timedate = $.trim($('#edit-expensesdatetime').val())
  let comment = $.trim($('#edit-text-comment').val())

  var trip_id_get = sessionStorage.getItem("tripid");
  var expense_id_get = sessionStorage.getItem("expenseid");
  // ensure input is validated
  // show error if it is not
  if (type === '' || amount_spent === '' || current_timedate === '') {
    showError("Fill in the required field.")
    return
  }
  else if (!isFinite(amount_spent) || isNaN(parseFloat(amount_spent))) {
    showError("Can use number and dot symbol only")
    return
  }

  db.transaction(
    function (tx) {
      tx.executeSql(
        SQL_UPDATE_ONE_EXPENSES,
        [type, amount_spent, current_timedate, comment, trip_id_get, expense_id_get],
        function (tx, result) { //clear ui
          onShowAllExpenses()
          onShowTotalExpenses()
          history.back();
        },
        function (tx, error) { showError('Failed to update expenses.') }
      )
    },
    function (error) { },
    function () { }
  )
}

function onShowDetailExpenses() {
  if (!isDbReady) {
    showError('Database not ready. Please try again later.')
    return
  }

  var trip_id_get = sessionStorage.getItem("tripid");
  var expense_id_get = sessionStorage.getItem("expenseid");
  db.transaction(
    function (tx) {
      tx.executeSql(
        SQL_SELECT_ONE_EXPENSES,
        [trip_id_get,expense_id_get],
        function (tx, result) {
          if (result.rows.length > 0) {
            $('#edit-text-expense-type').val(`${result.rows.item(0).expense_type}`)
            $('#edit-text-amount-expense').val(`${result.rows.item(0).money_spent}`)
            $('#edit-expensesdatetime').val(`${result.rows.item(0).time_record}`)
            $('#edit-text-comment').val(`${result.rows.item(0).comment_expense}`)
          }

        },
        function (tx, error) { showError('Failed to show expenses detail.') }
      )
    },
    function (error) { },
    function () { }
  )
}

function onDeleteExpense() {
  if (!isDbReady) {
    showError('Database not ready. Please try again later')
    return
  }

  var trip_id_get = sessionStorage.getItem("tripid");
  var expense_id_get = sessionStorage.getItem("expenseid");
  db.transaction(
    function (tx) {
      tx.executeSql(
        SQL_DELETE_ONE_EXPENSES,
        [trip_id_get, expense_id_get],
        function (tx, result) { //clear ui
          history.back();
        },
        function (tx, error) { showError('Failed to delete trip.') }
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
    $('#trip-search').on('input', function(){
      $('#cardContainer').empty();
      let trip_keyword = $(this).val();
      let search_category = $('input[name=radio-search]:checked').val();
      onShowSearchResult(trip_keyword, search_category);
    })

    $('input[name=radio-search]').on('change', function(){
      $('#cardContainer').empty();
      let trip_keyword = $('#trip-search').val();
      let search_category = $(this).val();
      onShowSearchResult(trip_keyword, search_category);
    })

    $('#btn-add-expense').on('click', onSaveNewExpensesClicked)
    $('#btn-edit-expense').on('click', onUpdateExpenses)
    $('#btn-delete-expense').on('click', onDeleteExpense)
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
            tx.executeSql(
              SQL_CREATE_EXPENSES_DETAIL,
              [],
              function (tx, result) {
                isDbReady = true
                console.log('SQL_CREATE_EXPENSES_DETAIL', 'OK')
                onShowTotalExpenses()
                onShowAllExpenses()
                onShowDetailExpenses()
                $('#add-expensesdatetime').on('click', function () {
                  // Get the current date and time
                  var now = new Date();

                  // Format the date and time
                  var dateString = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
                  var timeString = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

                  // Set the value of the input element to the date and time
                  $('#add-expensesdatetime').val(dateString + ' ' + timeString);
                });
                $('#edit-expensesdatetime').on('click', function () {
                  // Get the current date and time
                  var now = new Date();

                  // Format the date and time
                  var dateString = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
                  var timeString = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

                  // Set the value of the input element to the date and time
                  $('#edit-expensesdatetime').val(dateString + ' ' + timeString);
                });
              }, // SUCCESS callback
              function (tx, error) {
                isDbReady = false
                console.log('SQL_CREATE_EXPENSES_DETAIL ERROR', error.message)
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
