import axios from 'axios';

export default async function handler(req, res) {
  try {
    const response = await axios.get('https://nmw.prahwa.net/api/branches');
    const branch = response.data;
    res.status(200).json(branch);
  } catch (error) {
    console.error('Error fetching branch:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
 