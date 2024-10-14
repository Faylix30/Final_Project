const mysql = require('mysql');

module.exports = {
  createImageUpload: async (db, imageId, date, imageName) => {
    const sql = 'INSERT INTO image (image_id, date, image_name) VALUES (?, ?, ?)';
    const values = [imageId, date, imageName];

    try {
      const result = await db.query(sql, values);
      return result;
    } catch (error) {
      console.error('Error creating image upload:', error);
      throw error;
    }
  },
};