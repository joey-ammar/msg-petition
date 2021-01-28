/*
Canvas
*/

const canvas = $('#canvasInput');
const context = canvas[0].getContext('2d');

//Adding the event listener
canvas.on('mousedown', (event) => {
	let offset = canvas.offset();
	let x = event.pageX - offset.left;
	let y = event.pageY - offset.top;

	canvas.on('mousemove', function tool(event) {
		context.strokeStyle = '#1e2b3c';
		context.beginPath();
		context.moveTo(x, y);
		x = event.pageX - offset.left;
		y = event.pageY - offset.top;
		context.lineTo(x, y);
		context.stroke();
		//leaving part
		$(document).on('mouseup', () => {
			canvas.off('mousemove', tool);
			const signature = $("input[name='signature']");
			let finalUrl = signature.val(canvas[0].toDataURL('image/png'));
			console.log(finalUrl);
			const secrete = $('.hidden');
			console.log(secrete);
		});
	});
});

/**
 Form validation
 */

$('#form_first').focusout(() => {
	let checkFirst = $('#form_first').val().length;
	if (checkFirst < 3 || checkFirst > 12 || checkFirst == '') {
		$('#error-first').html('not valid!');
		$('#error-first').css({
			color: '#ff0000',
			fontSize: '11px',
			fontWeight: '400',
		});
		return false;
	} else {
		$('#error-first').html('valid');
		$('#error-first').css({
			color: '#1dd15d',
			fontSize: '11px',
			fontWeight: '400',
		});
		return true;
	}
});
$('#form_last').focusout(() => {
	let checkLast = $('#form_last').val().length;
	if (checkLast < 3 || checkLast > 12 || checkLast == '') {
		$('#error-last').html('not valid !');
		$('#error-last').css({
			color: '#ff0000',
			fontSize: '11px',
			fontWeight: '400',
		});
		return false;
	} else {
		$('#error-last').html('valid');
		$('#error-last').css({
			color: '#1dd15d',
			fontSize: '11px',
			fontWeight: '400',
		});
		return true;
	}
});
