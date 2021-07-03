//show bytes in file as braille
//type characters and convert - hex to braille

const bytes_per_line = 16;
const braille_block_s = 0x2800;
const braille_block_e = 0x28FF;

const bottom_pane = {};
const main_pane = {};
let current_select_offset = 0;
window.onload = () => {
	main_pane.braille = document.querySelector("#braille-content");
	main_pane.offset = document.querySelector("#braille-offset");
	main_pane.ascii = document.querySelector("#braille-ascii");

	bottom_pane.braille = document.querySelector("#braille-char");
	bottom_pane.hex = document.querySelector("#hex-char");
	bottom_pane.binary = document.querySelector("#binary-char");
	bottom_pane.unsigned = document.querySelector("#udec-char");
	bottom_pane.signed = document.querySelector("#sdec-char");

	updateBottomPane(generateValues(0xff));

	main_pane.braille.updateSelection = function() {
		return document.getSelection().collapse(this, current_select_offset);
	};

	main_pane.braille.onchange =
	main_pane.braille.oninput = function() {
		//validate
		let validated = "";
		let len = 0;
		for(let i = 0; i < this.innerText.length; i++) {
			const charcode = this.innerText.charCodeAt(i);
			if(charcode > braille_block_e || charcode < braille_block_s) continue; //ignore non-braille
			validated += `<span> ${this.innerText[i]} </span>`;
			//if(++len % bytes_per_line === 0 && this.innerText[i+1]) validated += "<br>";
		}
		this.innerHTML = validated.trim();
		//this.updateSelection();

		const linecount = Math.ceil(this.innerText.length / bytes_per_line);
		let offset_string = "";
		for(let i = 0; i < linecount; i++) {
			offset_string += (i * bytes_per_line).toString(16).padStart(8, "0") + "\n";
		}
		main_pane.offset.innerText = offset_string;

		let ascii = "";
		len = 0;
		for(const x of this.innerText.replace(/\n/g, "")) {
			const ascii_charcode = x.charCodeAt() - 0x2800;
			if(ascii_charcode === 32) {
				ascii += "&nbsp;";
			} else if(ascii_charcode > 32 && ascii_charcode < 127) {
				ascii += String.fromCharCode(ascii_charcode);
			} else {
				ascii += "⍰";//".";
			}
			if(++len % bytes_per_line === 0) ascii += "<br>";
		}
		main_pane.ascii.innerHTML = ascii.trim();
	}

	document.onkeydown = (e) => {
		//console.log(e);
		switch(e.code) {
			case "Backspace":
				--current_select_offset;
				break;

			case "ArrowDown":
				e.preventDefault();
				current_select_offset += bytes_per_line;
				if(current_select_offset >= main_pane.braille.innerText.length) current_select_offset = main_pane.braille.innerText.length;
				main_pane.braille.updateSelection();
				document.onselectionchange();
				break;

			case "ArrowUp":
				e.preventDefault();
				current_select_offset -= bytes_per_line;
				if(current_select_offset < 0) current_select_offset = 0;
				main_pane.braille.updateSelection();
				document.onselectionchange();
				break;

			case "KeyV":
				if(!e.ctrlKey) break;
				current_select_offset++;
				break;
		}
	}

	document.onselectionchange = () => {
		const select = document.getSelection();
		const index = Array.from(main_pane.braille.children).indexOf(select.focusNode.parentElement);
		if(index == -1) return;
		current_select_offset = index+1;

		console.log(select);
		const i = main_pane.braille.innerText.charCodeAt(current_select_offset) - braille_block_s;
		updateBottomPane(generateValues(i));
	};

	let braille_str = "";
	for(let i = 0; i < 256; i++) {
		braille_str += (i).toBraille();
	}
	main_pane.braille.innerText = braille_str;
	main_pane.braille.dispatchEvent(new Event("change"));
	main_pane.braille.focus();
};

function generateValues(integer) {
	const i = integer & 0xff;
	return {
		braille: String.fromCodePoint(0x2800 + i),
		hex: "0x" + (i).toString(16).padStart(2, "0"),
		binary: "0b" + (i).toString(2).padStart(8, "0"),
		unsigned: i,
		signed: (i > 127) ? i - 256 : i
	};
}

function updateBottomPane(values) {
	for(const [key, value] of Object.entries(values)) {
		bottom_pane[key].innerHTML = value;
	}
}
