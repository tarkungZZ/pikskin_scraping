const puppeteer = require('puppeteer')
const delay = require('../helpers/delay')
const pool = require('../helpers/mysql')
const { url, username, password } = require('../helpers/config')

module.exports = async () => {

    try {

        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            slowMo: 10
        })

        const page = (await browser.pages())[0]

        await page.goto(url)
        await page.waitForSelector('#username', { timeout: 3000 }).then(async () => {

            await page.type('#username', username)
            await delay(500)
            await page.type(`#password`, password)
            await delay(500)
            await page.click(`#btn_login`)

        }).catch((err) => {
            console.log(err)
        })

        await page.waitForSelector('#sidebar-left > div > ul > li:nth-child(2) > a > i', { timeout: 5000 }).then(async () => {

            await page.click(`#sidebar-left > div > ul > li:nth-child(2) > a > i`)

        }).catch((err) => {
            console.log(err)
        })

        await page.waitForSelector('body > section > div.mains.open-menu-right > div > div > div > div > div.align-items-center.row.search-box > div.col-12.col-md-12.col-lg-3.ml-auto > div > a', { timeout: 3000 }).then(async () => {

            for (let v = 0; v < 89; v++) {

                await delay(2000)

                for (let i = 0; i < 15; i++) {

                    try {

                        let arr = []

                        //await page.waitForSelector(`#div_main_content > div:nth-child(${i + 1}) > div > div > div.card-detail-front > div > div.card_box > div.block-title > a.h6.product-category`, { timeout: 5000 })

                        await delay(2000)

                        await page.click(`#div_main_content > div:nth-child(${i + 1}) > div > div > div.card-detail-front > div > div.card_box > div.block-title > a.h6.product-category`)

                        //await page.waitForSelector(`body > section:nth-child(10) > div > div > div > div:nth-child(1) > div:nth-child(1) > div > div > div:nth-child(1) > div > h3`, { timeout: 5000 })
                        await delay(2000)

                        const get_itemName = await page.$eval(`body > section:nth-child(10) > div > div > div > div:nth-child(1) > div:nth-child(1) > div > div > div:nth-child(1) > div > h3`, el => el.textContent)
                        //console.log(get_itemName + '\n')

                        const get_brandName = await page.$eval(`body > section:nth-child(10) > div > div > div > div:nth-child(1) > div:nth-child(1) > div > div > div:nth-child(1) > div > h5:nth-child(2)`, text => text.textContent)
                        const brand_name = get_brandName.slice(9)
                        //console.log(brand_name + '\n')

                        const get_category = await page.$eval(`body > section:nth-child(10) > div > div > div > div:nth-child(1) > div:nth-child(1) > div > div > div:nth-child(1) > div > h5:nth-child(4)`, text => text.textContent)
                        const category = get_category.slice(13)
                        //console.log(category + '\n')

                        const get_subCategory = await page.$eval(`body > section:nth-child(10) > div > div > div > div:nth-child(1) > div:nth-child(1) > div > div > div:nth-child(1) > div > h5:nth-child(5)`, text => text.textContent)
                        const sub_category = get_subCategory.slice(11)
                        //console.log(sub_category + '\n')

                        const get_discountPrice = await page.$eval(`body > section:nth-child(10) > div > div > div > div:nth-child(1) > div:nth-child(1) > div > div > div:nth-child(2) > div > div.product-price.text-succes > span`, text => text.textContent)
                        let discount_price = get_discountPrice.match(/([0-9.])/g)
                        discount_price = Number(discount_price.join(''))
                        //console.log(discount_price + '\n')

                        const get_normalPrice = await page.$eval(`body > section:nth-child(10) > div > div > div > div:nth-child(1) > div:nth-child(1) > div > div > div:nth-child(2) > div > div.product-price.n-sell > span`, text => text.textContent)
                        let normal_price = get_normalPrice.match(/([0-9.])/g)
                        normal_price = Number(normal_price.join(''))
                        //console.log(normal_price + '\n')

                        const get_itemDetail = await page.$eval(`body > section:nth-child(10) > div > div > div > div:nth-child(1) > div:nth-child(1) > div > div > div.col-12.sub-product-item`, text => text.textContent)
                        //console.log(get_itemDetail + '\n')

                        for (let n = 0; n < 5; n++) {

                            try {

                                const imgs = await page.$$eval(`body > section.section-move-bg.call-to-action-animation > div > div:nth-child(2) > div > div > div > div > div > div:nth-child(${n + 2}) img[src]`, imgs => imgs.map(img => img.getAttribute('src')))
                                arr.push(imgs[0])

                                //console.log(arr)

                            } catch (err) {
                                if (err) break
                            }

                        }

                        const data = {

                            item_name: get_itemName,
                            brand_name,
                            category,
                            sub_category,
                            discount_price,
                            normal_price,
                            item_detail: get_itemDetail,
                            img_url1: arr[0],
                            img_url2: arr[1],
                            img_url3: arr[2],
                            img_url4: arr[3],
                            img_url5: arr[4],

                        }

                        console.log(data)

                        await pool(`INSERT IGNORE INTO items SET ?`, [data]).then(async () => {
                            await page.goBack()
                        }).catch((err) => {
                            console.log(`mysql err`, err)
                        })

                    } catch (err) {

                        if (err) {

                            console.log(err)
                            i - 1
                            continue

                        }

                    }

                }

                await page.goto(`https://agent.pikskin.com/product.php?curr_page=${v + 2}`)

            }

        }).catch((err) => {
            console.log(err)
        })

    } catch (err) {

        console.log(err)

    }

}