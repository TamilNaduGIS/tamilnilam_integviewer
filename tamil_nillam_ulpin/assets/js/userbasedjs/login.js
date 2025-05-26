//var api = "https://tngis.tnega.org/tngis_api/api/";
var sso_api = "https://tngis.tnega.org/sso_api/app/api/api_results.php";
var otp_api = "https://tngis.tnega.org/sso_api/app/api/otp.php";
var sso_app_id = 3;
var baseURL = String(document.location.href).replace(/#/, "");
var page_url = baseURL.split('/');
page = page_url[3].split('.');
page = page[0];

var total;//register captcha
var total1;//forgot pwd captcha
var nonceValue;
var otp_value;
var reg_check = false;
var OTPtimeout;
var sso_login_ran = 'login_response1234';
checkLogin();
createSum();
createSum1();
//getDepartmentList();
$( "#ans" ).keyup(checkInput);
$( "#ans1" ).keyup(checkInput1);
$('#reset_captcha_register').click(createSum);
$('#reset_captcha_register1').click(createSum1);
$(".toggle-password").click(function() {
  $(this).find('i').toggleClass("mdi-eye mdi-eye-off");
  
  var input = $(this).parent().find('#pass');
  if (input.attr("type") == "password") {
    input.attr("type", "text");
  } else {
    input.attr("type", "password");
  }
});
$('.removespecialchar').on('input',function(){
	$(this).val($(this).val().replace(/[^0-9a-z ./_]/gi, ''));
});
$('.validatemobile').on('input',function(){
	$(this).val($(this).val().replace(/[^0-9]/gi, ''));
});
$('.otp_text').on('input',function(){
	if($(this).val()=='')
	{

	}
	else
	{
		$(this).parent().nextAll().find('.input').val('');
		$(this).parent().next().find('.input').focus();
	}
});
// login for public, department
$('#login_official').on('submit',function(e){
	e.preventDefault(); 
	var user = $('#uname').val();
   	var password   = $('#pass').val();
   	var captcha   = $('#textBox').val();
   	//$('#textBox').attr('disabled',true);
	// Encrypt form data
	let encryption = new Encryption();
	var unameEncrypted = encryption.encrypt(user, nonceValue);
	var passwordEncrypted = encryption.encrypt(password, nonceValue);
	var captchaEncrypted = encryption.encrypt(captcha, nonceValue);
	document.getElementById("uname").value = unameEncrypted;
	document.getElementById("pass").value = passwordEncrypted;
	document.getElementById("textBox").value = captchaEncrypted;
	$('#submit').attr('disabled',true);
	var login_data = $('#login_official').serialize();
		$.ajax({
    	  type: "POST",
    	  headers: { 'X-APP-KEY': 'tngis!@#' },
    	  url:sso_api,
    	  dataType: "json",
    	  data: login_data,
		  xhrFields: { withCredentials: true},
    	  processData: false, 
    	  success: function (data){
         	if(data.user_valid == true){
         	//$('#textBox').attr('disabled',false);
         		if(data.user['email']!=''){
	        		var user_data = data.user;
	        	 	$.ajax({
					    type: "POST",
					    url:"https://tngis.tnega.org/tngis_api/api/user.php",
					    dataType: "json",
						xhrFields: { withCredentials: true },
					    data: {'case':'successlogin','user_data':user_data},
						success: function (role_data){
						    user_data.application_id = encryption.decrypt(user_data.application_id, sso_login_ran);
						    user_data.email = encryption.decrypt(user_data.email, sso_login_ran);
						    user_data.mobileno = encryption.decrypt(user_data.mobileno, sso_login_ran);
						    user_data.name = encryption.decrypt(user_data.name, sso_login_ran);
						    user_data.uid = encryption.decrypt(user_data.uid, sso_login_ran);
						    user_data.user_id = encryption.decrypt(user_data.user_id, sso_login_ran);
								if(role_data.success == true){
						    		user_data.user_role_id = role_data.role['role_id'];
						    		user_data.permission = role_data.role['permissioncode'];
						    	}else{
						    	  	user_data.user_role_id = '';
						    	  	user_data.permission = '';
						    	}
						    var now = new Date();
							var time = now.getTime();
								time += 3600 * 1000;
								now.setTime(time);
								document.cookie = 'tngis_user_info=' + JSON.stringify(user_data) + '; expires=' + now.toUTCString() + '; path=/;secure';
							role_authorisation();
						},
						error:function (err) {   
							console.error('Error1', err);
						}
					});			
					setTimeout(function () {window.location.href = 'index.html';}, 900);
	        	    $('.login_btn').addClass('d-none'); 
	        	    $('.logout').removeClass('d-none');
	        	    login_check = true;
	        	}else{
	        	 	$('#submit').attr('disabled',false);
	        	    const toast = new bootstrap.Toast(document.getElementById('errorToast'));
	        	    // toast.show();
	        	    // $('#uname').val('');
	   				// $('#pass').val('');
	   				// $('#textBox').val('');
	   				// login_check = false;
					//    console.error('Error2');
					toastr.options = {
						"closeButton": true,
						"progressBar": true,
						"positionClass": "toast-top-right",
						"timeOut": "3000",
						"onHidden": function () {
							$('#uname').val('');
							$('#pass').val('');
							$('#textBox').val('');
						  }
					  };
					toastr.error('Login failed');
	        	} 
         	}

		 	if(data.user_valid == false){
         		$('#submit').attr('disabled',false);
         	   	const toast = new bootstrap.Toast(document.getElementById('errorToast'));
         	   	toast.show();
         	   	$('#uname').val('');
   				$('#pass').val('');
   				$('#textBox').val('');
   				login_check = false;
   				//$('#department').val('');
   				//$('#textBox').attr('disabled',false);
				console.error('Error3 ');
         	}
      	},	
      	error:function (xhr, xhrFields) {   
			console.log('unauthorized user');
			toastr.options = {
				"closeButton": true,
				"progressBar": true,
				"positionClass": "toast-top-right",
				"timeOut": "3000",
				"onHidden": function () {
					$('#uname').val('');
					$('#pass').val('');
					$('#textBox').val('');
				  }
			  };
			toastr.error('Unauthorized user. Please login again.', 'Access Denied');
      	}
   	});
});



$('.logout_user').on('click',function(){
	var user = JSON.parse(getCookie('tngis_user_info'));
	var sso_ui = user.user_id;
	$.ajax({
      type: "POST",
      url:"https://tngis.tnega.org/tngis_api/api/user.php",
      dataType: "json",
      data: {'case':'logout'},
      success: function (data){
      	//console.log(data);
         if(data.message == true)
         {
            const toast = new bootstrap.Toast(document.getElementById('logoutToast'))
            toast.show()
            $('.login_btn').removeClass('d-none');
            $('.logout').addClass('d-none');
            $('#uname').val('');
   			$('#pass').val('');
   			$('#textBox').val('');
   			//$('#department').val('');
   			document.cookie = 'tngis_user_info=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
   			login_check = false;
   			role_authorisation();
			
         }
      },
      error:function (err) {   
         //alert(err);
      }
   });
   $.ajax({
      type: "POST",
      headers: { 'X-APP-KEY': 'tngis!@#' },
      url:sso_api,
      dataType: "json",
      data: {'case':'logout','user_id':sso_ui,'app_id':sso_app_id},
      success: function (data){
      	if(page == 'profile')
		   {
		   	window.location = './';
		   }
      }
   });
});
$('input[name="user_type"]').on('change',function(){
	if($(this).val()=='ins' || $(this).val()=='ngo')
	{
		$('.institution_content').removeClass('d-none');
	}
	else
	{
		$('.institution_content').addClass('d-none');
		$('#institution').val('')
	}
});
$('#countrylist').on('change',function(){
	if($(this).val()!='India')
	{
		$('.state_section').addClass('d-none');
		$('.district_section').addClass('d-none');
		$('#statelist').val('');
		$('#districtlist').val('');
	}
	else
	{
		$('.state_section').removeClass('d-none');
	}
});
$('#statelist').on('change',function(){
	if($(this).val()!='Tamil Nadu')
	{
		$('.district_section').addClass('d-none');
		$('#districtlist').val('');
	}
	else
	{
		$('.district_section').removeClass('d-none');
		$.ajax({
			type:"POST",
			url:"https://tngis.tnega.org/tngis_api/api/user.php",
			dataType:'json',
			data:{'case':'getdistrict'},
			success:function(result){
				var option_text = '';
				$('#districtlist').empty();
				$('#districtlist').append("<option value=''>Select District</option>");
				var option_result = result.district;
				option_result.forEach(function (option) {
			     option_text += '<option value="'+option.district_lgd_code+'">'+option.district_name+'</option>';
			  	});
				$('#districtlist').append(option_text);
			}
		});
	}
});
jQuery.validator.addMethod("lettersonly", function(value, element) {
    return this.optional(element) || /^[a-z]+$/i.test(value);
}, "Letters only please");
jQuery.validator.addMethod("pwcheck", function(value) {
   return /^[A-Za-z0-9\d=!\-@._*]*$/.test(value) // consists of only these
       && /[A-Z]/.test(value) // has a uppercase letter
       && /[a-z]/.test(value) // has a lowercase letter
       && /[0-9]/.test(value) // has a number
       && /[@._#]/.test(value) // has a number
},"Password must contain of atlease one (lowercase, uppercase, special character, number)");
$("#register").validate({
	ignore:":not(:visible)",
	rules: {
		name:
		{
			required:true,
		},
		dob:
		{
			required:true,
		},
		careof:
		{
			required:true,
		},
		father_name:
		{
			required:true,
		},
		institution:
		{
			required:true,
			lettersonly:true
		},
		country:
		{
			required:true,
		},
		state:
		{
			required:true,
		},
		district:
		{
			required:true,
		},
		gender:
		{
			required:true,
		},
		email:
		{
			required:true,
			remote:{
			type: "POST",
			url:  sso_api,
			dataType: 'json',
			headers: { 'X-APP-KEY': 'tngis!@#' },
			data: {
					'field_name':'email',
					'field_value': function () { return $('#email').val(); },
					'app_id':  '3',
					'case': 'user_dup_check'
				}
			}
		},
		reentry_email:
		{
			required:true,
			equalTo: "#email"
		},
		password:{
			required:true,minlength: 8,maxlength: 16,pwcheck:true
		},
		reenter_password:{
			required:true,minlength: 8,maxlength: 16,
			equalTo: "#password"
		},
		mobileno:
		{
			required:true,
			digits: true,
			minlength: 10,
			maxlength:10,
			remote:{
			type: "POST",
			url:  sso_api,
			dataType: 'json',
			headers: { 'X-APP-KEY': 'tngis!@#' },
			data: {
		      'field_name':'mobileno',
		      'field_value': function () { return $('#mobileno').val(); },
		      'app_id':  '3',
		      'case': 'user_dup_check'
			 }
			}
		},
	},
	messages: {
		email: {
			remote: "Email already Exist!"
		}
	},
	submitHandler: function(form) {
	  if ($("#mobileno").val() == '')
	  {

	  }
	  else
	  {
	  	$("#otpnumber").text('+91 ' + $("#mobileno").val());
	  	$(".otpmodal").modal("show");
      OTP();
	  }
	}
});
$("#forgotpassword").validate({
	rules: {
		forgotemail:
		{
			required:true,
			remote:{
			type: "POST",
			url:  sso_api,
			dataType: 'json',
			headers: { 'X-APP-KEY': 'tngis!@#' },
			data: {
					'field_name':'email',
					'field_value': function () { return $('#forgotemail').val(); },
					'app_id':  '3',
					'type': 'forgot_password_check',
					'case': 'user_dup_check'
				}
			}
		},
	},
	messages: {
		email: {
			remote: "Email already Exist!"
		}
	},
	submitHandler: function(form) {
		$('#emailToken').val(token());
		sendEmail();
	}
});
/*START:Re-Send OTP*/
$("#btnResendOTP").on('click',function(){
	OTP();
	$("#btnResendOTP").addClass('d-none');
	$("#otp_1").val('');
	$("#otp_2").val('');
	$("#otp_3").val('');
	$("#otp_4").val('');
});
/*END:Re-Send OTP*/
$('#applications').on('auxclick','a', function(e) {
  if (e.which === 2) {
   e.preventDefault();
  }
});
$("#applications").on("contextmenu",function(e){
 return false;
}); 
$('body').on('click','.login_available',function(e){
	var auth_column_encrypt;
	e.preventDefault();
	var external_app_login_column = $(this).prev().prev().text();
	var tngis_user_column = $(this).prev().text();
	var login_url = $(this).attr('href');
	var user_cookie = getCookie('tngis_user_info');
	if(user_cookie === undefined)
	{
		window.open(login_url, '_blank');
	}
	else
	{
		var app_login_url = $(this).attr('href')+'php/sso_validation.php'
		var tngis_user_info = JSON.parse(getCookie('tngis_user_info'));
		$.each(tngis_user_info, function(k, v) {
		    //display the key and value pair
			if(k == tngis_user_column)
			{
		    	let encryption = new Encryption();
				auth_column_encrypt = encryption.encrypt(v, nonceValue);
			}
		});
		$.ajax({
         type: 'POST',
         headers: { 'X-APP-KEY': 'sso$auth!','Ran':nonceValue },
         url: app_login_url,
         data: {
            'auth_column':auth_column_encrypt
         },
         dataType: 'json',
         success: function (data) {
            if(data.response==true)
            {
            	window.open(login_url, '_blank');
            }
         }
      });
	}
});
$('body').on('click','.sso_validate_tngis',function(e){
	var auth_column_encrypt;
	e.preventDefault();
	var tngis_application_id = $(this).next().text();
	var login_url = $(this).attr('href');
	var tngis_logged_user_data = getCookie('tngis_user_info');
	if(tngis_logged_user_data === undefined)
	{
		window.open(login_url, '_blank');
	}
	else
	{
		var tngis_user_info = JSON.parse(getCookie('tngis_user_info'));
		$.ajax({
			type:"POST",
			url:sso_api,
			headers: { 'X-APP-KEY': 'tngis!@#' },
			dataType:'json',
			data:{'case':'sso_validate','user_id':tngis_user_info['user_id'],'tngis_application_id':tngis_application_id,'application_id':sso_app_id},
			success:function(result){
				console.log(result);
				if(result.success==true)
				{
					var now = new Date();
					var time = now.getTime();
					time += 3600 * 1000;
					now.setTime(time);
					document.cookie = 
					'sso_validate_'+result.data['application_id']+'=' + JSON.stringify(result.data) + 
					'; expires=' + now.toUTCString() + 
					';secure';
					window.open(login_url, '_blank');
				}
				else
				{
					window.open(login_url, '_blank');
				}
			}
		});
		/*var app_login_url = $(this).attr('href')+'php/sso_validation.php'
		var tngis_user_info = JSON.parse(getCookie('tngis_user_info'));
		$.each(tngis_user_info, function(k, v) {
		    //display the key and value pair
			if(k == tngis_user_column)
			{
		    	let encryption = new Encryption();
				auth_column_encrypt = encryption.encrypt(v, nonceValue);
			}
		});
		$.ajax({
         type: 'POST',
         headers: { 'X-APP-KEY': 'sso$auth!','Ran':nonceValue },
         url: app_login_url,
         data: {
            'auth_column':auth_column_encrypt
         },
         dataType: 'json',
         success: function (data) {
            if(data.response==true)
            {
            	window.open(login_url, '_blank');
            }
         }
      });*/
	}
});

$('.login_tab').on('click',function(){
	//if($(this).text()=='Public Login')
	if($(this).attr('id')=='profile-tab1')
	{
		$('.register_public_user').removeClass('d-none');
		$('#category').val(1);
		$('#login_check_column').val('mobileno');
		$('#uname').attr('placeholder','Mobile Number');
		document.getElementById("uname").type="text"; 
		$( "#uname" ).addClass( "validatemobile" );
	}
	else
	{
		$('.register_public_user').addClass('d-none');
		$('#category').val(2)
		$('#login_check_column').val('user_id');
		$('#uname').attr('placeholder','User ID');
		$( "#uname" ).removeClass( "validatemobile" );
	}
});

$('#refresh').on('click',function(){

	let encryption = new Encryption();
	let captchaText = document.querySelector('#captcha');
	let correctCaptcha = captchaText.dataset.dummy;
	var captchaEncryptedServer = encryption.encrypt(correctCaptcha, 'TNG!S@captcha123');
	$.ajax({
		type:"POST",
		url:"https://tngis.tnega.org/tngis_api/api/user.php",
		dataType:'json',
		data:{'case':'refresh_login_check','check_value':captchaEncryptedServer},
		success:function(result){
		}
	});
})


function checkLogin(){
	var option_text = '';
	let encryption = new Encryption();
	let captchaText = document.querySelector('#captcha');
	let correctCaptcha = captchaText.dataset.dummy;
	var captchaEncryptedServer = encryption.encrypt(correctCaptcha, 'TNG!S@captcha123');
	$.ajax({
		type:"POST",
		url:"https://tngis.tnega.org/tngis_api/api/user.php",
		dataType:'json',
		xhrFields: {withCredentials: true},
		data:{'case':'check_login','check_value':captchaEncryptedServer},
		success:function(result){
			/*$('#department').empty();
			$('#department').append("<option value=''>Select Department</option>");
			var option_result = result.department_list;
			option_result.forEach(function (option) {
		     option_text += '<option value="'+option.department_code+'">'+option.department_name+'</option>';
		  	});
			$('#department').append(option_text);*/
			nonceValue = result.nonceValue;
			login_check = result.check_login;
			$('#check_value').val(nonceValue);
			role_authorisation();
			document.cookie = 'tngis_key= E6118D88FB28B1F36CB7851B1FFAB';
		},
		error: function(xhr, status, error) {
			console.error('AJAX error:', status, error);
			console.error('Response text:', xhr.responseText);
		}
	});
}
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
  	cookie_name = parts.pop().split(';').shift();
  	return cookie_name;
  }
}


function getRandom(){return Math.ceil(Math.random()* 20);}
function createSum(){
		var randomNum1 = getRandom(),
			randomNum2 = getRandom();
	total =randomNum1 + randomNum2;
  $( "#question" ).text( randomNum1 + " + " + randomNum2  );  
  $("#ans").val('');
  checkInput();
}
function createSum1(){
		var randomNum1 = getRandom(),
			randomNum2 = getRandom();
	total1 =randomNum1 + randomNum2;
  $( "#question1" ).text( randomNum1 + " + " + randomNum2  );  
  $("#ans1").val('');
  checkInput1();
}
function checkInput(){
	var input = $("#ans").val(), 
		slideSpeed = 200,
	hasInput = !!input, 
	valid = hasInput && input == total;
	 $('#message').toggle(!hasInput);
	 $('#register_btn').prop('disabled', !valid);  
	 $('#success').toggle(valid);
	 $('#fail').toggle(hasInput && !valid);
}
function checkInput1(){
	var input = $("#ans1").val(), 
		slideSpeed = 200,
	hasInput = !!input, 
	valid = hasInput && input == total1;
	$('#forgotpassword_btn').prop('disabled', !valid);  
}
/*START:OTP*/
function OTP()
{
	OTPtimeout = setTimeout(otptimeout, 300000);
	document.getElementById('timer').innerHTML = '';
	var mobileno=$("#mobileno").val();
	/*SEND OTP AJAX CALL*/
	var form = new FormData();

	 $.ajax({
      type: 'POST',
      headers: { 'X-APP-KEY': 'tngis!@#','Ran':nonceValue },
      url: otp_api,
      data: {
         "mobileno": mobileno,
         'type': 'send',
         'otp_type': 'sms'
      },
      dataType: 'json',
      success: function (data, textStatus, http) {
         if (http.status == 200) {
            if (data[0].success == 1) {
               Swal.fire({
					   icon: "success",
					   title: data[0].message,
					   showConfirmButton: true,
					   timer:3000,
					});
            } else {
            	Swal.fire({
					   icon: "error",
					   title: data[0].message,
					   showConfirmButton: true
				   })
            }
         } else if (http.status == 401) {
            Swal.fire({
				   icon: "error",
				   title: data[0].message,
				   showConfirmButton: true
			   })
         } else {
            Swal.fire({
				   icon: "error",
				   title: data[0].message,
				   showConfirmButton: true
			   })
         }
      },
      error: function (data, textStatus, http) {
	   	//console.log(data)
	   	if(data.status == 400)
	   	{
	   		Swal.fire({
				   icon: "error",
				   title: data.responseJSON[0].message,
				   showConfirmButton: true
			   })
	   	}
	   	else
	   	{
	   		Swal.fire({
				   icon: "error",
				   title: data.responseJSON[0].message,
				   showConfirmButton: true
			   })
	   	}
	   }
   })
	otp_value = 5544;
	//timer(180);
}
/*END:OTP*/
// OTP verify
function OTP_verify()
{
 var mobileno=$("#mobileno").val();
 if (!$("#otp_1").val() && !$("#otp_2").val() && !$("#otp_3").val() && !$("#otp_4").val()) 
 {
   Swal.fire({
	   icon: "error",
	   title: 'Please Enter OTP!',
	   showConfirmButton: true
   })
 } 
 else 
 {
	var otp_entered=parseInt($("#otp_1").val()+$("#otp_2").val()+$("#otp_3").val()+$("#otp_4").val());
   	
  /*OTP Verify API CAll*/
   var form = new FormData();
  form.append("otp_type", "sms");
  form.append("mobile_number", mobileno);
  form.append("request_type", "verify");
  form.append("otp", otp_entered);

   $.ajax({
	   type: 'POST',
	   headers: { 'X-APP-KEY': 'tngis!@#','Ran':nonceValue },
	   url: otp_api,
	   data: {
	      'mobileno': mobileno,
	      'type': 'check',
	      'otp_entered': otp_entered
	   },
	   dataType: 'json',
	   success: function (data, textStatus, http) {
	      //console.log(http);
	      if (http.status == 200) {
	      	let encryption = new Encryption();
		   	var response_status = encryption.decrypt(data[0].success, nonceValue);
		   	var response_message = encryption.decrypt(data[0].message, nonceValue);
	         if (response_status == 1) {
	         	clearTimeout(OTPtimeout);
	         	$('#otp_validated_using').val('mobileno');
	            registration(); 
	         } else {
	            Swal.fire({
					   icon: "error",
					   title: response_message,
					   showConfirmButton: true
				   })
	         }
	      }
	   },
	   error: function (data, textStatus, http) {
	   	clearTimeout(OTPtimeout);
	   	let encryption = new Encryption();
	   	var response_status = encryption.decrypt(data.responseJSON[0].success, nonceValue);
	   	var response_message = encryption.decrypt(data.responseJSON[0].message, nonceValue);
	   	//console.log(data)
   		Swal.fire({
			   icon: "error",
			   title: response_message,
			   showConfirmButton: true
		   })
	   }
	})
  }
}
// end OTP verify
function otptimeout()
{
	clearTimeout(OTPtimeout);
	location.reload();
}
/*START:Timer Start*/
let timerOn = true;

function timer(remaining) {
  var m = Math.floor(remaining / 60);
  var s = remaining % 60;
  
  m = m < 10 ? '0' + m : m;
  s = s < 10 ? '0' + s : s;
  document.getElementById('timer').innerHTML = m + ':' + s;
  remaining -= 1;
  
  if(remaining >= 0 && timerOn) {
    setTimeout(function() {
        timer(remaining);
    }, 1000);
    return;
  }

  if(!timerOn) {
    // Do validate stuff here
    return;
  }
  if(reg_check == false)
  {
	  // Do timeout stuff here
		Swal.fire({
			icon: "error",
			title: 'Timeout For OTP!',
			showConfirmButton: true
		})
		$("#btnResendOTP").removeClass('d-none');
		$("#res_otp").val('');
		$("#otp_1").val('');
		$("#otp_2").val('');
		$("#otp_3").val('');
		$("#otp_4").val('');
	}

}
/*END:Timer Start*/
function registration()
{
	var register_password = $('#password').val();
	let encryption = new Encryption();
	var encrypted_register_password = encryption.encrypt(register_password, nonceValue);
	document.getElementById("password").value = encrypted_register_password;
	$('#repassword').attr('disabled',true);
	var register_data = $('#register').serialize();
	$.ajax({
		method: "POST",
		headers: { 'X-APP-KEY': 'tngis!@#','Ran':nonceValue  },
		url:sso_api,
		dataType: "json",
		data: register_data,
		// processData: false, 
		success: function (data){
			console.log(data);
			if(data.message == 'success')
			{
				var register_user_id = data.id;
				$.ajax({
			      type: "POST",
			      url:"https://tngis.tnega.org/tngis_api/api/user.php",
			      dataType: "json",
			      data: {'case':'successpublicregister','register_user_id':register_user_id},
			      success: function (data){
			      	if(data.success==true)
			      	{
			      		reg_check = true;
				      	Swal.fire({
							   icon: "success",
							   title: 'OTP Verified & Registered successfully!',
							   showConfirmButton: true,
							   timer:3000,
							});
							$(".otpmodal").modal("hide");
							$('.registerUsers').modal("hide");
							$('#name').val('');
							$('#dob').val('');
							$('#father_name').val('');
							$('#institution').val('');
							$('#countrylist').val('');
							$('#statelist').val('');
							$('#districtlist').val('');
							$('#plot_door_no').val('');
							$('#building_street').val('');
							$('#address1').val('');
							$('#address2').val('');
							$('#area').val('');
							$('#locality').val('');
							$('#mobileno').val('');
							$('#email').val('');
							$('#reentry_email').val('');
							$('#password').val('');
							$('#repassword').val('');
							$('#repassword').attr('disabled',false);
							$('#ans').val('');
							$('.state_section').addClass('d-none')
							$('.district_section').addClass('d-none')
							$('.institution_content').addClass('d-none')
							$('input[name="careof"]').prop('checked',false);
							$('input[name="gender"]').prop('checked',false);
							$('input[name="user_type"]').prop('checked',false);
							createSum();
				      }
			      }
			   });
			}
		}
   });
}
// send email for reset password
function sendEmail()
{
	var forgot_password_data = $('#forgotpassword').serialize();
	$.ajax({
      type: "POST",
      url:"https://tngis.tnega.org/tngis_api/api/user.php",
      dataType: "json",
      data: forgot_password_data,
      success: function (data){
      	//console.log(data);
      	if(data.success==true)
      	{
      		Swal.fire({
				   icon: "success",
				   title: 'Password Reset Link sent to '+$('#forgotemail').val(),
				   showConfirmButton: true,
				   timer:4000,
				});
				$('#forgotemail').val('');
				$('#emailToken').val('');
				$('#ans1').val('');
				$('.forgotPwd').modal('hide');
      	}
      	else
      	{
      		Swal.fire({
				   icon: "error",
				   title: 'Please try again',
				   showConfirmButton: true,
				   timer:2000,
				});
      	}
      }
   });
}
var rand = function() {
    return Math.random().toString(36).substr(2); // remove `0.`
};

var token = function() {
    return rand() +rand() +rand() +rand() + rand(); // to make it longer
};
function role_authorisation()
{
	var user_log_check = getCookie('tngis_user_info')
	if(user_log_check === undefined)
	{
		$('#data_view_section').addClass('d-none');
		$('#user_stat_section').addClass('d-none');
	}
	else
	{
		var user_data = JSON.parse(getCookie('tngis_user_info'));
		if(user_data['user_role_id']=='10' || user_data['user_role_id'] == '1000')
		{
			$('#data_view_section').addClass('d-none');
			$('#user_stat_section').addClass('d-none');
		}
		else
		{
			$('#data_view_section').removeClass('d-none');
			$('#user_stat_section').removeClass('d-none');
		}
		$('.login_btn').addClass('d-none')
		$('.logout').removeClass('d-none');
	}
}