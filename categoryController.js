import categoryModel from "../models/categoryModels.js";
import slugify from 'slugify'
export const createCategoryController = async (req, res) => {
    try {
        const { name} = req.body;
        if(!name) {
            return res.status(401).send({ 
                message: 'Name is required'})
        }
        const existingCategory = await categoryModel.findOne({name})
        if(existingCategory) {
            return res.status(200).send({
                success: true,
                message: 'Category already exists'})
        }
        const category = await new categoryModel({name, slug:slugify(name)}).save()
        return res.status(201).send({
            success: true,
            message: 'Category created successfully',
            category
        })
    }catch (error) {
        console.error(error);
        res.status(500).send({ 
            success:false,
            error,
            message: "Error in Category"
         });
    }
};

//update ctegory
export const updateCategoryController = async (req, res) => {
    try {
        const { name } = req.body
        const {id} = req.params
       const category= await categoryModel.findByIdAndUpdate(
        id,
        {name, slug: slugify(name)},
        {new:true}
       );
       res.status(200).send({
        success: true,
        message: 'Category updated successfully',
        category,
       });
    }catch(error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error,
            message: "Error while Updating Category"
            })
    }

}

//get all category
export const categoryController = async (req, res) => {
    try {
      const category = await categoryModel.find({});
      res.status(200).send({
       success: true,
       message: "All Categories List",
       category, 
      });
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error,
            message: "Error while fetching categories"
        })
    }
};

//single category
export const singleCategoryController = async (req, res) => {
    try {
      const category = await categoryModel.find({slug:req.params.slug});
      res.status(200).send({
       success: true,
       message: "Get Single Category Successfully",
       category, 
      });
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error,
            message: "Error while fetching Single category"
        })
    }
};

//delete ctegory
export const deleteCategoryController = async (req, res) => {
    try { 
        const {id} = req.params
       await categoryModel.findByIdAndDelete(id);
       res.status(200).send({
        success: true,
        message: 'Category deleted successfully',
       });
    }catch(error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error,
            message: "Error while deleting Category"
            })
    }

}