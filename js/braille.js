{
	const braille_block = 0x2800;

	//typedef
	window.Braille = function(str) {
		this.toAsciiString = () => {
			let ret = "";
			for(const c of str) {
				ret += String.fromCodePoint(c.codePointAt() - braille_block);
			}
			return ret;
		};

		this.toArray = () => {
			let ret = [];
			for(const c of str) {
				ret.push(c.codePointAt() - braille_block);
			}
			return ret;
		}

		this.toByteArray = () => Uint8Array.from(this.toArray());
		this.toSignedByteArray = () => Int8Array.from(this.toArray());

		this.toString = () => {
			return str;
		}
	}

	Number.prototype.toBraille = function() {
		if(this > 255) throw `(${this}) is greater than 255`;
		if(this < 0) throw `(${this}) is less than 0`;
		return new Braille( String.fromCodePoint(braille_block + this) );
	}

	String.prototype.toBraille = function() {
		let ret = "";
		for(const c of this) {
			const codepoint = c.codePointAt();
			if(codepoint > 255) throw `(${this}) ${c} has a codepoint greater than 255`;
			ret += String.fromCodePoint(braille_block + codepoint);
		}
		return new Braille(ret);
	}

	Array.prototype.toBraille = function() {
		let ret = "";
		for(const c of this) {
			if(c > 255) throw `([${this}]) ${c} is greater than 255`;
			if(c < 0) throw `([${this}]) ${c} is less than 0`;
			ret += String.fromCodePoint(braille_block + c);
		}
		return new Braille(ret);
	}

	Uint8Array.prototype.toBraille =
	Int8Array.prototype.toBraille = function() {
		let ret = "";
		for(const c of this) {
			const i = (c & 0xff); //ensure unsigned
			ret += String.fromCodePoint(braille_block + i);
		}
		return new Braille(ret);
	}
}
