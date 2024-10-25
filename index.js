const express = require('express')
const bodyParser = require('body-parser');
const http = require('http')
const xlsx = require('xlsx');
const path = require('path');

const app = express()

const server = http.createServer(app)

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'))

app.post('/submit', (req, res) => {
    const request = {
        warehouse: parseInt(req.body.warehouse),
        aisle: {
            start: parseInt(req.body.aisleStart),
            end: parseInt(req.body.aisleEnd)
        },
        bay: {
            start: parseInt(req.body.bayStart),
            end: parseInt(req.body.bayEnd)
        },
        column: parseInt(req.body.column),
        row: parseInt(req.body.row)
    }

    let data = [];

    for (let aisle = 0; aisle <= (request.aisle.end - request.aisle.start); aisle++) {

        for (let bay = 0; bay <= (request.bay.end - request.bay.start); bay++) {

            for (let column = 0; column < request.column; column++) {

                for (let row = 0; row < request.row; row++) {
                    
                    let location = {
                        prefix: `${request.warehouse + request.aisle.start + aisle}`,
                        suffix: `${request.bay.start + bay}${column + 1}${row + 1}`
                    }

                    data.push({
                        code: `${location.prefix}.${location.suffix}`,
                        label: `${request.aisle.start + aisle}.${location.suffix}`
                    })
                }
            }
        }

    }

    const filePath = path.join(__dirname, 'locations.xlsx');
    const workbook = xlsx.utils.book_new();

    const worksheet = xlsx.utils.json_to_sheet(data, { header: ["label", "code"] });

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Locations');

    xlsx.writeFile(workbook, filePath);

    res.download(filePath, 'locations.xlsx', (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(500).send('Error downloading file.');
        }
    });
});

const port = 3000

server.listen(port, () => {
    console.clear()
    console.log(`Server is running on port ${port}`)
})