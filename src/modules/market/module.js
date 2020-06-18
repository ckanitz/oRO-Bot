/**
 * oRO-Bot Market module.
 * This module handles the 'ws' command
 * and provides a list of available venders
 * to an requested item.
 *
 * @type {Module}
 */

// Import functions, configs etc.
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const { findLastIndex, isEmpty } = require('lodash');

const { prefix } = require('../../config.json');
const { version } = require('../../../package.json');

const config = require('./config.json');
const Module = require('../module.js');

/**
 * Market-Module Class
 */
class Market extends Module {
	/**
	 * Constructor.
	 *
	 * @param {Array} modules  array of all enabled modules.
	 */
	constructor(modules) {
		super(modules);
		this.config = config;
		this.modules = modules;

		this.api = {
			avg: 'https://originsro.dashaus-ro.de/Market/Averages',
			history: 'https://originsro.dashaus-ro.de/Market/History',
		};

		this.mapCache = {};
	}

	onAvg(args, message) {
		const { itemId, itemName } = this.validateItem(args);
		const { avg } = this.api;
		// prepare the response.
		const response = {
			color: 0x00ff6e,
			title: "__**oRO Market AVG**__",
			fields: [],
			footer: {
				text: `oRO-Bot v${ version }`
			},
		};

		axios.get(`${avg}?itemId=${itemId}&itemName=${itemName}`)
			.then(function ({data}) {
				// handle success
				const min7days = Math.round(data['history-min-7days']).toString();
				const max7days = Math.round(data['history-max-7days']).toString();
				const avg7days = Math.round(data['history-avg-7days']).toString();
				const min30days = Math.round(data['history-min-30days']).toString();
				const max30days = Math.round(data['history-max-30days']).toString();
				const avg30days = Math.round(data['history-avg-30days']).toString();

				const input = itemName.length ? itemName : itemId;

				response.title = `AVG Price: __**${data.searchinfo}**__ (${input})- oRO Market`;
				response.fields.push( {
					name: 'Last 7 days:',
					value: `Min: ${min7days}z\n**øAvg: ${avg7days}z**\nMax: ${max7days}z`,
				} );
				response.fields.push( {
					name: 'Last 30 days:',
					value: `Min: ${min30days}z\n**øAvg: ${avg30days}**z\nMax: ${max30days}z`,
				} );
			})
			.catch(function (error) {
				// handle error
				console.log({error});
			})
			.finally(function () {
				message.channel.send( { embed: response } );
			});
	}

	onWhoSells(args, message) {
		const { itemId, itemName } = this.validateItem(args);
		const { avg, history } = this.api;
		// prepare the response.
		const response = {
			color: 0x00ff6e,
			title: "__**oRO Market History**__",
			fields: [],
			image: {
				url: '',
			},
			footer: {
				text: `oRO-Bot v${ version }`
			}
		};

		axios.get(`${avg}?itemId=${itemId}&itemName=${itemName}`)
			.then(({data}) => {
				// handle success
				const label = itemName.length ? itemName : itemId;
				const avg7days = this.formatPrice(data['history-avg-7days']);
				const avg30days = this.formatPrice(data['history-avg-30days']);
				const avgItemname = data.searchinfo;

				response.title = `Who Sells: __**${label}**__ - oRO Market`;

				response.fields.push({
					name: `**Average Price**`,
					value: `**ø 7 days: ${avg7days}z**\nø 30 days: ${avg30days}z)`,
				});

				axios.get(`${history}?itemId=${itemId}&itemName=${itemName}`)
					.then(async ({data}) => {
						// handle success
						const activeMerchLastIndex = findLastIndex(data, function(m) { return m.isCurrentShop });
						const maxIndex = activeMerchLastIndex < 3 ? activeMerchLastIndex : 3;

						for(let i = maxIndex; i > 0; i--) {
							// Merchant.
							const m = data[activeMerchLastIndex - (maxIndex - i)];
							const itemTitle = `**${m.item.name}${m.item.slots > 0 ? '[' + m.item.slots + ']' : '' }** (${m.item.itemID})`;
							const navshop = `\n\`\`\`fix\n@navshop ${m.vendorName}\`\`\``;
							const positionInfo = `**${m.positionMap}** ${m.positionX}/${m.positionY}`;
							const price = `**${this.formatPrice(m.price)}z**`;

							let mapUrl = false;

							if ( i === maxIndex && m.positionMap === 'prontera' ) {
								mapUrl = await this.getMapImageUrl({
									map: m.positionMap,
									x: m.positionX,
									y: m.positionY,
								});
								response.image.url = mapUrl;
							}

							response.fields.push({
								name: `**[${m.shopName}]**`,
								value: `Item: ${itemTitle}\nPrice: ${price}\nPosition: ${positionInfo}\n${navshop}`,
							});
						}
					})
					.catch(function (error) {
						// handle error
						console.log({error});
					})
					.finally(function () {
						message.channel.send({ embed: response });
					});
			})
			.catch(function (error) {
				// handle error
				console.log({error});
			});
	}

	validateItem(args) {
		let itemId = '';
		let itemName = '';

		if (args.length === 1 && parseInt( args ).toString() !== 'NaN' ) {
			itemId = args;
		} else {
			itemName = args.join('%20').toLowerCase();
		}

		return { itemId, itemName };
	}

	formatPrice(number) {
		return Math.round(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	}

	getMapImageUrl(posInfo) {
		return new Promise( async (resolve, reject) => {
			const dir = path.dirname(__filename);
			const filename = `${posInfo.map}_${posInfo.x}_${posInfo.y}.png`;

			if (typeof this.mapCache[`${dir}/cache/${filename}`] !== 'undefined') {
				resolve(this.mapCache[`${dir}/cache/${filename}`]);
			} else {
				const imgUrl = await this.createPinMap(posInfo, dir, filename);
				// //const imgurUrl = await this.uploadImgur(pinmapPath);
				// console.log({pinmapPath});
				resolve(imgUrl);
			}
		});
	}

	createPinMap(posInfo, dir, filename) {
		const map = `${dir}/maps/${posInfo.map}.png`;
		const pin = { path: `${dir}/assets/pin.png`, width: 25, height: 34 };

		return new Promise((resolve, reject) => {
			const image = sharp(map);

			image.metadata()
				.then((metadata) => {
					const filepath = `${dir}/cache/${filename}`;
					return image.composite([{
						input: pin.path,
						left: Math.round(posInfo.x - pin.width / 2),
						top: Math.round(metadata.height - posInfo.y - pin.height),
						gravity: 'south',
					}])
					.toFile(`${dir}/cache/${filename}`, (err, info) => {
						if (!err) {
							console.log( 'cached: ', {info, filename});

							fs.readFile(filepath, (err, data) => {
								console.log(err,data, filepath);
								if (!err) {
									axios({
										'method': 'POST',
										'url': 'https://api.imgur.com/3/upload',
										'headers': {
											'Authorization': 'Client-ID 8c3e45c908a924f',
											'Content-Type': 'image/png',
										},
										data
									}).then(({data}) => {
										this.mapCache[filepath] = data.data.link;
										console.log(data, data.data, data.data.link);
										resolve(data.data.link);
									}).catch((err)  =>{
										console.log(err);
									});
								} else {
									console.log(err);
								}
							});

							//resolve(filepath);
						} else {
							console.log(err);
						}
					});
			});
		});
	}

	uploadImgur(filepath) {
		return new Promise((resolve, reject) => {
			fs.readFile(filepath, (err, data) => {
				if (!err) {
					axios({
						'method': 'POST',
						'url': 'https://api.imgur.com/3/upload',
						'headers': {
							'Authorization': 'Client-ID 8c3e45c908a924f',
							'Content-Type': 'image/png',
						},
						data
					}).then(function({data}) {
						this.mapCache[filepath] = data.data.link;
						resolve(data.data.link);
					}).catch(function(err) {
						console.log(err.data);
					});
				} else {
					console.log(err);
				}
			});
		});
	}

	// toCache(key, value) {
	// 	const dir = path.dirname(__filename);
	// 	const filename = `${dir}/cache/map.cache`;
	//
	// 	fs.readFile(filename, read(err, data) => {
	// 		if (err) {
	// 			throw err;
	// 		}
	// 		const cache = JSON.parse(data);
	// 		cache[key] = value;
	// 		console.log(cache,key,value);
	//
	// 		fs.writeFile(filename, JSON.stringify(cache), (err) => {
	// 			if (err) return console.log(err);
	// 		});
	// 	});
	// }
	//
	// fromCache(key) {
	// 	return new Promise((resolve, reject) => {
	// 		const dir = path.dirname(__filename);
	// 		const filename = `${dir}/cache/map.cache`;
	//
	// 		fs.readFile(filename, read(err, data) => {
	// 			if (err) {
	// 				throw err;
	// 			}
	// 			const cache = JSON.parse(data);
	// 			const result = cache[key]
	// 
	// 			resolve();
	// 		});
	// 	});
	// }
}

module.exports = Market;
