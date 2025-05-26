// function used to create captacha as image
function createCaptchaImage(captchaText) {
	const canvas = document.createElement('canvas');
	canvas.width = 160;
	canvas.height = 60;
	const ctx = canvas.getContext('2d');
	ctx.font = '30px Arial';
	ctx.fillStyle = '#0b1f47';
	ctx.shadowColor = 'rgba(45, 173, 192, 0.7)';
	ctx.shadowOffsetX = 2;
	ctx.shadowOffsetY = 2;
	ctx.shadowBlur = 3;
	ctx.fillText(captchaText, 10, 40);
	return canvas.toDataURL(); // Returns the image data URL
}

let captchaText = document.querySelector('#captcha');
let userText = document.querySelector('#textBox');
let submitButton = document.querySelector('#submit');
let output = document.querySelector('#output');
let refreshButton = document.querySelector('#refresh');
$('#submit').attr('disabled', true);
let alphaNums = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '2', '3', '4', '5', '6', '7', '8'];
let emptyArr = [];
for (let i = 1; i <= 6; i++) {
	emptyArr.push(alphaNums[Math.floor(Math.random() * alphaNums.length)]);
}

// generate captacha as image
var textFORCAPTACHA = emptyArr.join('');
var captchaImageSrc = createCaptchaImage(textFORCAPTACHA);
captchaText.innerHTML = `<img src="${captchaImageSrc}" alt="CAPTCHA">`;
captchaText.dataset.dummy = textFORCAPTACHA;
let correctCaptcha = captchaText.dataset.dummy;
// console.log(correctCaptcha);
// captchaText.innerHTML = emptyArr.join('');
submitButton.addEventListener('click', function () {
	if (userText.value === correctCaptcha) {
		/*output.classList.add("greenText");
		output.innerHTML = "Correct!";*/
		$('#submit').attr('disabled', false);
		output.innerHTML = '';
	} else {
		output.classList.add("redText");
		$('#submit').attr('disabled', true);
		output.innerHTML = "Incorrect Captcha, please try again";
	}
});

refreshButton.addEventListener('click', function () {

	userText.value = "";
	let refreshArr = [];
	for (let j = 1; j <= 6; j++) {
		refreshArr.push(alphaNums[Math.floor(Math.random() * alphaNums.length)]);
	}
	var textFORCAPTACHA = refreshArr.join('');
	var captchaImageSrc = createCaptchaImage(textFORCAPTACHA);
	captchaText.innerHTML = `<img src="${captchaImageSrc}" alt="CAPTCHA">`;
	correctCaptcha = textFORCAPTACHA;
	output.innerHTML = "";

});

submitButton.addEventListener('keyup', function (e) {
	if (e.keyCode === 13) {

		if (userText.value === correctCaptcha) {
			/*console.log("correct!");
			output.classList.add("greenText");
			output.innerHTML = "Correct!";*/
			$('#submit').attr('disabled', false);
			output.innerHTML = '';
		} else {
			output.classList.add("redText");
			$('#submit').attr('disabled', true);
			output.innerHTML = "Incorrect Captcha, please try again";
		}
	}
});
userText.addEventListener('keyup', function (e) {
	$('#submit').attr('disabled', true);
	if (userText.value.length == correctCaptcha.length) {
		if (userText.value === correctCaptcha) {
			/*output.classList.add("greenText");
			output.innerHTML = "Correct!";*/
			$('#submit').attr('disabled', false);
			output.innerHTML = '';
		} else {
			output.classList.add("redText");
			$('#submit').attr('disabled', true);
			output.innerHTML = "Incorrect Captcha, please try again";
		}
	}

});