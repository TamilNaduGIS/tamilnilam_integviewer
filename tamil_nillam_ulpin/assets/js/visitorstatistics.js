// var api = 'http://localhost/TNGIS-Redesign-Backend/api/api_results.php';
var stats_api = 'https://tngis.tnega.org/tngis_api/api/api_results.php';
var globalApi = 'https://tngis.tnega.org/sso_api/app/api/api_results.php';
  //START: Page visitor count
      var counterContainer = document.querySelector(".website-counter");
      var visitCount = localStorage.getItem("page_view");
      // Check if page_view entry is present
      if (visitCount) 
      {
        $.ajax({
             url: stats_api,
             type: "POST",
             dataType:'JSON',
             data:{'case':'get_visitor_count','isfirst':0},
             success: function(response)
             {
                visitCount=response.visitor.counter;
                localStorage.setItem("page_view", visitCount);
                counterContainer.innerHTML = visitCount;
             }
             });
      } 
      else 
      {
        $.ajax({
             url: stats_api,
             type: "POST",
             dataType:'JSON',
             data:{'case':'get_visitor_count','isfirst':1},
             success: function(response)
             {
                visitCount=response.visitor.counter;
                localStorage.setItem("page_view", visitCount);
                counterContainer.innerHTML = visitCount;
             }
             });
      }
      //END: Page visitor count

      //START: USER STATISTICS
      var userContainer = document.querySelector(".website-users");
      $.ajax({
           url: globalApi,
           type: "POST",headers: { 'X-APP-KEY': 'tngis!@#' },
           dataType:'JSON',
           data:{'case':'user_count','app_id':3},
           success: function(response)
           {
              if(response.status == 1)
              {
                userContainer.innerHTML = response.user_count;
              }
              else
              {
              }
           }
           });
      //END:

      $("#ddl_category").change(function(){
        if(login_check == false){
          Swal.fire({
            icon: "error",
            title: 'Please login to Share FeedBack!',
            showConfirmButton: true,
            timer: 2000
          });
          $("#feedback_form")[0].reset();
        }
      });


      /*START:Feedback form */
           $('#feedback_form').on('submit',function(e){
            e.preventDefault();
            var user_log_check = getCookie('user_info')
            if(user_log_check === undefined)
            {
              Swal.fire({
              icon: "error",
              title: 'Please login!',
              showConfirmButton: true
              });
              $("#feedback_form")[0].reset();
            }
            else
            {
             // var user_data = JSON.parse(getCookie('user_info'));
             var category_name=$('#ddl_category option:selected').text();
             $('#category_name').val(category_name);
              e.preventDefault();
                  $.ajax({
                    type:"POST",
                    url:api+"api/api_results.php",
                    data:new FormData(this),
                    contentType: false,
                    dataType:'JSON',
                    cache: false,
                    processData: false,//{'case':'insert_feedback'},
                    success:function(result)
                    {

                     if (result == 'success')
                     {
                       Swal.fire({
                       icon: "success",
                       title: 'Your Feedback Submitted Successfully!',
                       showConfirmButton: true
                       })
                       $("#feedback_form")[0].reset();
                     }
                     else
                     {
                       Swal.fire({
                       icon: "error",
                       title: 'Something went wrong Please try again!',
                       showConfirmButton: true
                       })
                     }
                      
                    }
                  });
              
            }


             
               
           });
           /*END:Feedback form */

           function getCookie(name) {
             const value = `; ${document.cookie}`;
             const parts = value.split(`; ${name}=`);
             if (parts.length === 2) {
              cookie_name = parts.pop().split(';').shift();
              return cookie_name;
             }
           }

     
