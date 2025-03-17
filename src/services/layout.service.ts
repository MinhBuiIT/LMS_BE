import { LayoutBody } from '~/@types/layout';
import cloudinary from '~/config/cloudinary';
import { BadRequestResponse } from '~/core/error.response';
import { LayoutModel } from '~/models/layout.model';

export const createLayoutService = async (body: LayoutBody) => {
  const foundLayout = await LayoutModel.findOne({ type: body.type });
  if (foundLayout) {
    throw new BadRequestResponse(`Layout type ${body.type} already exists`);
  }

  switch (body.type) {
    case 'banner': {
      if (!body.banner) {
        throw new BadRequestResponse('Banner is required');
      }
      const result = await cloudinary.uploader.upload(body.banner.image, {
        folder: 'lms/layout'
      });
      return await LayoutModel.create({
        type: body.type,
        banner: {
          title: body.banner.title,
          subTitle: body.banner.subTitle,
          image: {
            url: result.secure_url,
            public_id: result.public_id
          }
        }
      });
    }
    case 'category': {
      if (!body.category) {
        throw new BadRequestResponse('Category is required');
      }
      return await LayoutModel.create({
        type: body.type,
        categories: body.category.map((name) => ({ name }))
      });
    }
    // case 'faq': {
    //   if (!body.faq) {
    //     throw new BadRequestResponse('FAQ is required');
    //   }
    //   return await LayoutModel.create({
    //     type: body.type,
    //     faqs: body.faq.map(({ question, answer }) => ({ question, answer }))
    //   });
    // }
    default:
      throw new BadRequestResponse('Invalid type');
  }
};

export const updateLayoutService = async (body: LayoutBody) => {
  const foundLayout = await LayoutModel.findOne({ type: body.type });
  if (!foundLayout) {
    throw new BadRequestResponse(`Layout type ${body.type} doesn't exist`);
  }

  switch (body.type) {
    case 'banner': {
      if (!body.banner) {
        throw new BadRequestResponse('Banner is required');
      }
      if (foundLayout.banner?.image.public_id) {
        await cloudinary.uploader.destroy(foundLayout.banner.image.public_id);
      }

      const result = await cloudinary.uploader.upload(body.banner.image, {
        folder: 'lms/layout'
      });
      const newBanner = {
        title: body.banner.title,
        subTitle: body.banner.subTitle,
        image: {
          url: result.secure_url,
          public_id: result.public_id
        }
      };
      return await LayoutModel.findOneAndUpdate({ type: body.type }, { banner: newBanner }, { new: true });
    }
    case 'category': {
      if (!body.category) {
        throw new BadRequestResponse('Category is required');
      }
      return await LayoutModel.findOneAndUpdate(
        { type: body.type },
        { categories: body.category.map((name) => ({ name })) },
        { new: true }
      );
    }
    // case 'faq': {
    //   if (!body.faq) {
    //     throw new BadRequestResponse('FAQ is required');
    //   }
    //   return await LayoutModel.findOneAndUpdate(
    //     { type: body.type },
    //     { faqs: body.faq.map(({ question, answer }) => ({ question, answer })) },
    //     { new: true }
    //   );
    // }
    default:
      throw new BadRequestResponse('Invalid type');
  }
};

export const getLayoutService = async (type: string) => {
  return await LayoutModel.findOne({ type });
};
