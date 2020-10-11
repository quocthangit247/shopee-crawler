import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class AppService {
  getCurrentPage(pageNumber) {
    return `https://shopee.vn/shop/22458198/search?page=${pageNumber}&sortBy=pop`;
  }

  getBreadcrum(breadcrumTag: any) {
    const cookData = [];
    const breadcrumName = '';
    breadcrumTag.children.forEach(item => {
      if (item.localName == 'a') {
        cookData.push(item);
      }
    });

    // remove shopee's text
    cookData.shift();
    cookData.map(item => breadcrumName.concat(item.innerText));

    return breadcrumName;
  }

  async getHello(): Promise<any> {
    const pageCount = 1 || 22;
    const listProducts = [];
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const detailPage = await browser.newPage();

    let i = 0;
    while (i < pageCount) {
      await page.goto(this.getCurrentPage(i), { waitUntil: 'networkidle2' });

      const currentProducts = await page.evaluate(() => {
        const products = [];
        const product_wrapper = document.querySelectorAll('a[data-sqe]');
        product_wrapper.forEach(product => {
          products.push({
            name: (product.querySelector('div[data-sqe]')
              .firstChild as HTMLElement).innerText,
            link: product.getAttribute('href'),
          });
        });
        return products;
      });

      i += 1;
      console.log('>>>>>>>>>>>>>>>>>> index', i);

      listProducts.push(...currentProducts);
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;

    listProducts.map(async item => {
      console.log('>>>>>>>>>>>>>>>>', 'linkkkkkkkkkkkkk', item.link);
      await detailPage.goto('https://shopee.vn'.concat(item.link), {
        waitUntil: 'networkidle2',
      });

      await detailPage.evaluate(() => {
        const breadcrumTag = document.querySelector(
          '.page-product__breadcrumb',
        );
        // const breadcrumName = that.getBreadcrum(breadcrumTag);
        const cookData = [];
        const breadcrumName = '';
        (breadcrumTag.children as any).forEach(item => {
          if (item.localName == 'a') {
            cookData.push(item);
          }
        });

        // remove shopee's text
        cookData.shift();
        cookData.map(item => breadcrumName.concat(item.innerText));
        console.log('>>>>>>>>>>>>>>>>>', 'breadcrumName', breadcrumName);
      });
    });

    return null;
  }
}
