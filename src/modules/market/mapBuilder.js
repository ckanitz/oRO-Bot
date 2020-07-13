const { isEmpty } = require('lodash');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const ImgurUploader = require('../../lib/ImgurUploader.js');

class MapBuilder {
	/**
	 * Class constructor.
	 *
	 * @param  {object} pos Map, x, y
	 */
	constructor(pos) {
		this.dir = path.dirname(__filename);
		this.pos = pos;
		this.map = {
			path: `${this.dir}/cache`,
			filename: `${this.pos.map}_${this.pos.x}_${this.pos.y}.png`,
		};
		this.pin = {
			path: `${this.dir}/assets`,
			filename: 'pin.png',
			width: 25,
			height: 34,
		};
		this.cache = {
			path: `${this.dir}/cache`,
			filename: 'map.cache',
		};
	}

	/**
	 * Return the imgur url to a location pinned map.
	 *
	 * @param  {object} posInfo Map, x, y
	 * @return {Promise}        On success resolve the imgUrl
	 */
	getMapImageUrl() {
		return new Promise(async (resolve, reject) => {
			const cache = false;//await this.cacheGet(this.map.filename);

			if (!!cache) {
				resolve(cache);
			} else {
				const imgUrl = await this.createMap();
				resolve(imgUrl);
			}
		});
	}

	createMap() {
		return new Promise(async (resolve, reject) => {
			let response = false;
			const map = `${this.dir}/maps/${this.pos.map}.png`;

			if (fs.existsSync(map)) {
				const image = sharp(map);
				const filepath = `${this.map.path}/${this.map.filename}`;
				const metadata = await image.metadata();

				const img = await image.composite([{
						input: `${this.pin.path}/${this.pin.filename}`,
						left: Math.round(this.pos.x - this.pin.width / 2),
						top: Math.round(metadata.height - this.pos.y - this.pin.height),
						gravity: 'south',
					}])
					.toFile(filepath);

				if (img) {
					const uploader = new ImgurUploader(filepath);
					const imageUrl = await uploader.getImageUrl();
					response = imageUrl;

					// if (imageUrl) {
					// 	this.cacheSet(this.map.filename,imageUrl);
					// }
				}
			} else {
				console.log(`Mapfile ${this.pos.map}.png does not exist in ${dir}/maps/`);
			}

			resolve(response);
		});

	}

	/**
	 * Receive the cash value to a given key if any exists
	 *
	 * @param  {string}  key Key to a cashvalue.
	 * @return {Promise}     The cache value if key give, whole cache otherwise.
	 */
	cacheGet(key = false) {
		const that = this;

		return new Promise((resolve, reject) => {
			fs.readFile(
				`${this.cache.path}/${this.cache.filename}`,
				function read(err, data) {
					// Bail on error.
					if (err) {
						console.log('Something went wrong while reading the map.cache', err);
						reject(err);
					} else {
						console.log(data);
						const cache = JSON.parse(data);
						let response = false;

						if (!key) {
							// Return the whole cache state.
							response = cache;
						} else {
							response = cache[key] || false;
						}

						resolve(response);
					}
				}
			)
		});
	}

	async cacheSet(key, value) {
		const cache = this.cacheGet();
		cache[key] = value;
		console.log({key,value});

		fs.writeFile(
			`${this.cache.path}/${this.cache.filename}`,
			JSON.stringify(cache || {}), (err) => {
				if (err) {
					return console.log('Something went wrong while writing the map.cache', err);;
				};
			}
		);
	}
}

module.exports = MapBuilder;
