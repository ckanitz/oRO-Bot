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

const { formatPrice } = require('../../lib/helper.js');
const { prefix } = require('../../config.json');
const { version } = require('../../../package.json');

const config = require('./config.json');
const Module = require('../module.js');
const MapBuilder = require('./mapBuilder.js');

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
				text: `oRO-Bot v${ version } - API by @derMob`
			},
		};

		axios.get(`${avg}?itemId=${itemId}&itemName=${itemName}`)
			.then(function ({data}) {
				// handle success
				const min7days = formatPrice(data['history-min-7days'], 'z');
				const max7days = formatPrice(data['history-max-7days'], 'z');
				const avg7days = formatPrice(data['history-avg-7days'], 'z');
				const min30days = formatPrice(data['history-min-30days'], 'z');
				const max30days = formatPrice(data['history-max-30days'], 'z');
				const avg30days = formatPrice(data['history-avg-30days'], 'z');

				const input = itemName.length ? null : `(${itemId}) `;

				response.title = `AVG Price: __**${data.searchinfo}**__ ${input}- oRO Market`;
				response.fields.push( {
					name: 'Last 7 days:',
					value: `Min: ${min7days}\n**ø Avg: ${avg7days}**\nMax: ${max7days}`,
				} );
				response.fields.push( {
					name: 'Last 30 days:',
					value: `Min: ${min30days}\n**ø Avg: ${avg30days}**\nMax: ${max30days}`,
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
				text: `oRO-Bot v${ version } - API by @derMob`
			}
		};

		axios.get(`${avg}?itemId=${itemId}&itemName=${itemName}`)
			.then(({data}) => {
				// handle success
				const label = itemName.length ? itemName : itemId;
				const avg7days = { val: data['history-avg-7days'], formatted: formatPrice(data['history-avg-7days'], 'z') };
				const avg30days = { val: data['history-avg-30days'], formatted: formatPrice(data['history-avg-30days'], 'z') };
				const avgItemname = data.searchinfo;

				response.title = `Who Sells: __**${avgItemname}**__ - oRO Market`;

				response.fields.push({
					name: `**Average Price**`,
					value: `**ø 7 days: ${avg7days.formatted}**\nø 30 days: ${avg30days.formatted})`,
				});

				console.log(`fetching ${history}?itemId=${itemId}&itemName=${itemName}`);

				axios.get(`${history}?itemId=${itemId}&itemName=${itemName}`)
					.then(async (resp) => {
						const { data } = resp;
						// handle success
						const activeMerchLastIndex = findLastIndex(data, function(m) { return m.isCurrentShop });
						const maxIndex = activeMerchLastIndex < 2 ? activeMerchLastIndex : 2;

						// Bail out if we got no shopdata.
						if ( data.length <= 0 || activeMerchLastIndex < 0 ) {
							response.fields.push({
								name: '**SOLD OUT**',
								value: 'not for sale right now\ngotta go farm, boi!',
							});

							return;
						}

						let cheapest = {};

						for(let i = maxIndex; i >= 0; i--) {
							console.log({i,maxIndex});
							// Merchant.
							const m = data[activeMerchLastIndex - (maxIndex - i)];
							// **Knife[4]** (1234)
							const itemTitle = `**${m.item.name}${m.item.slots > 0 ? '[' + m.item.slots + ']' : '' }** (${m.item.itemID})`;
							const price = `**${formatPrice(m.price, 'z')}** (${formatPrice(m.price - avg7days.val, 'z')} ø 7d)`;
							// **prontera** 12/34
							const positionInfo = `**${m.positionMap}** ${m.positionX}/${m.positionY}`;
							const navshop = `\n\`\`\`fix\n@navshop ${m.vendorName}\`\`\``;

							const field = {
								name: `**[${m.shopName}]**`,
								value: `Item: ${itemTitle}\n
										Price: ${price}\n
										Position: ${positionInfo}
										${navshop}`,
							};

							let mapUrl = false;

							if ( i === maxIndex ) {
								const mb = new MapBuilder({
									map: m.positionMap,
									x: m.positionX,
									y: m.positionY,
								});
								const mapUrl = await mb.getMapImageUrl();
								response.image.url = mapUrl;
								cheapest = field;
							}

							// Maybe duplicate the cheapest merchant to the end to
							// provide a better view on mobile.
							response.fields.push(field);
						}

						response.fields.push({
							name: '### ### ###',
							value: '**Best Offer:**',
						});

						response.fields.push(cheapest);
					})
					.catch(function (error) {
						// handle error
						console.log({error});
					})
					.finally(function () {
						console.log(response);
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
}

module.exports = Market;
