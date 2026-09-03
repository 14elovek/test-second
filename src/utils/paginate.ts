import { Model, FilterQuery } from 'mongoose'

interface PaginateOptions {
   page: number,
   limit: number,
   sort?: any
}

export async function paginate<T>(
   model: Model<T>,
   filter: FilterQuery<T>,
   options: PaginateOptions
) {
   const page = Math.max(1, options.page);
   const limit = Math.max(1, options.limit);
   const skip = (page - 1) * limit;
   const sort = options.sort || { _id: -1 };

   const [items, totalItems] = await Promise.all([
      model.find(filter).sort(sort).skip(skip).limit(limit),
      model.countDocuments(filter)
   ]);

   const totalPages = Math.ceil(totalItems / limit);

   return {
      data: items,
      meta: {
         totalItems,
         totalPages,
         currentPage: page,
         limit
      }
   };
}