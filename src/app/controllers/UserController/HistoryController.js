const axios = require('axios');

class HistoryController {
    async index(req, res) {
        const token = req.session.user.token;
        try {
            const response = await axios.get('http://localhost:3000/api/job/getAllDetailJobs', {
                headers: {
                    Authorization: `Bearer ${token}`, 
                },
            });

            const jobs = response.data.data;
            res.render('History/home', {
                layout: 'main.hbs',
                jobs, 
            });
        } catch (error) {
            console.error('Error fetching job statistics:', error.message);

            res.status(500).send('Có lỗi xảy ra khi lấy dữ liệu.');
        }
    }
}

module.exports = new HistoryController();
