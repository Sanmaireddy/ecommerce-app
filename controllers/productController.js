import slugify from "slugify";
import productModel from "../models/productModel.js";
import fs from "fs";

export const createProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files; //read documentation of fs & express-formidale
    //validation...fu..uhh lets use cp..
    switch (true) {
      case !name:
        res.status(500).send({ error: "Name is Required" });
      case !description:
        res.status(500).send({ error: "Description is Required" });
      case !category:
        res.status(500).send({ error: "Category is Required" });
      case !quantity:
        res.status(500).send({ error: "Quantity is Required" });
      case photo && photo.size > 1000000:
        res
          .status(500)
          .send({ error: "Photo is Required ans should be less than 1MB" });
    }
    const products = await productModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(200).send({
      success: true,
      message: "Product Created Sucessfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating Product",
    });
  }
};

//get all products
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      message: "All Products",
      products,
      countTotal: products.length,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting all products",
      error: error.message,
    });
  }
};

//get single product
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category"); //contains id of category
    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting single product",
      error,
    });
  }
};

//get photo
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting photo",
      error,
    });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "Successfully deleted product",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting the photo",
      error,
    });
  }
};

export const updateProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files; //read documentation of fs & express-formidale
    //validation...fu..uhh lets use cp..
    switch (true) {
      case !name:
        res.status(500).send({ error: "Name is Required" });
      case !description:
        res.status(500).send({ error: "Description is Required" });
      case !category:
        res.status(500).send({ error: "Category is Required" });
      case !quantity:
        res.status(500).send({ error: "Quantity is Required" });
      case photo && photo.size > 1000000:
        res
          .status(500)
          .send({ error: "Photo is Required ans should be less than 1MB" });
    }
    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(200).send({
      success: true,
      message: "Product updated Sucessfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(200).send({
      success: false,
      message: "Error while updating the product",
      error,
    });
  }
};