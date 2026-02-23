
import MarketplaceItem from '../models/Marketplace.js';


export const getAllItems = async (req, res) => {
  try {
    const items = await MarketplaceItem.findAll({ order: [['created_at', 'DESC']] });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getItemById = async (req, res) => {
  try {
    const item = await MarketplaceItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const createItem = async (req, res) => {
  try {
    const { title, description, price, seller, image } = req.body;
    if (!title || !price || !seller) {
      return res.status(400).json({ error: 'Title, price, and seller are required.' });
    }
    const newItem = await MarketplaceItem.create({
      title,
      description,
      price,
      seller_id: seller,
      images: image ? [image] : [],
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    });
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const item = await MarketplaceItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    const { title, description, price, status, image } = req.body;
    item.title = title ?? item.title;
    item.description = description ?? item.description;
    item.price = price ?? item.price;
    item.status = status ?? item.status;
    if (image) item.images = [image];
    item.updated_at = new Date();
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const item = await MarketplaceItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    await item.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
