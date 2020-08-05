import 'reflect-metadata';
import { plainToClass } from "class-transformer";
import { Product } from './product.model'
import {validate} from "class-validator";

const products = [
  { title: '商品1', price: 100 },
  { title: '商品2', price: 200 },
]

const p1 = new Product('商品1', 100)
console.log(p1.getInformation())


const loadedProducts = plainToClass(Product, products)

for (const p of loadedProducts) {
  console.log(p.getInformation())
}

const newProd = new Product('', -100)
validate(newProd).then(errors => {
  if (errors.length > 0) {
    console.log('バリデーションエラー', errors)
  } else {
    console.log(newProd.getInformation())
  }
})
