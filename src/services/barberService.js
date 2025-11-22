// services/barberService.js
const getBarberById = async (barberId) => {
  const query = `
    SELECT 
      b.*,
      u.name,
      u.email,
      u.phone,
      u.avatar
    FROM barbers b
    JOIN users u ON b.user_id = u.id
    WHERE b.id = $1
  `;
  
  const result = await db.query(query, [barberId]);
  return result.rows[0];
};

const getBarbersByShop = async (shopId) => {
  const query = `
    SELECT 
      b.*,
      u.name,
      u.email,
      u.phone,
      u.avatar
    FROM barbers b
    JOIN users u ON b.user_id = u.id
    WHERE b.barbershop_id = $1  -- if you have this column
    AND b.is_available = true
  `;
  
  const result = await db.query(query, [shopId]);
  return result.rows;
};