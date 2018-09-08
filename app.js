const sql = require('mssql')

const config = {
	user: 'iEx',
	password: 'iEx',
	server: 'SERVERALEXIS\\SQLEXPRESS', 
	database: 'ARES' 
  };

/*
  const config = {
	user: 'DB_A3F769_ARES_admin',
	password: 'razors1805',
	server: 'sql7002.site4now.net', 
	database: 'DB_A3F769_ARES' 
  };
*/

var express = require("express");
var app = express();
const PORT = process.env.PORT || 3000;


var router = express.Router();
var bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use(express.static('public'));

//var path = __dirname + '/views/';
var path = __dirname + '/'

var customers = [];

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});

app.get("/",function(req,res){
	//res.sendFile(path + "index.html");
	res.sendFile(path + 'public/index.html');
});

app.post("/api/customers/save", function(req,res){
	console.log('Post a Customer: ' + JSON.stringify(req.body));
	var customer = {};
	customer.firstname = req.body.firstname;
	customer.lastname = req.body.lastname;
	
	customers.push(customer);
	
	return res.send(customer);
});

app.get("/api/customers/all", function(req,res){
	console.log("Get All Customers");
	return res.send(customers);
});

app.get("/api/productos/all", async(req,res)=>{

	var filtro = req.query.filtro;
	console.log(filtro);

	var fila = '';
	
sql.connect(config, err => {
	    // ... error checks
	    var strSql = '';

		//strSql="select CODPROD, DESPROD, DESPROD3 FROM PRODUCTOS WHERE DESPROD LIKE '%" + filtro + "%' ORDER BY CODPROD";
		strSql = "SELECT PRECIOS.CODPROD, PRODUCTOS.DESPROD, PRECIOS.CODMEDIDA, CONCAT('Q ' , CONVERT(money,PRECIOS.PRECIO )) as PRECIO FROM PRECIOS LEFT OUTER JOIN PRODUCTOS ON PRECIOS.CODPROD = PRODUCTOS.CODPROD AND PRECIOS.EMPNIT = PRODUCTOS.EMPNIT WHERE PRODUCTOS.DESPROD LIKE '%" + filtro + "%'";
	
	    const request = new sql.Request()
	    request.stream = true // You can set streaming differently for each request
	    
		request.query(strSql) // or request.execute(procedure)
	                           
	    request.on('recordset', columns => {
	        // Emitted once for each recordset in a query
	    })
	 
	    request.on('row', row => {
	        // Emitted for each row in a recordset
			var stcodigo = "'" + row.CODPROD + "'";
			var stdescripcion = "'" + row.DESPROD + "'";
			fila = fila + '<tr><td>' + row.CODPROD + '</td><td>' + row.DESPROD + '</td><td>' + row.CODMEDIDA + '</td><td class="text-right">' + row.PRECIO +  '</td></tr>';
		})
	 
	    request.on('error', err => {
	        // May be emitted multiple times
		   
	    })
	 
	    request.on('done', result => {
	        
		// Always emitted as the last one
			sql.close()
			var result = fila;
			res.send(result);
			console.log('Datos cargados')			   
	    })
	})
	 
	sql.on('error', err => {
	    // ... error handler
			console.log('No se pudo cargar la Lista. Error: ' + err)
			//return 'Error al cargar'
	})
});

app.use("/",router);


app.use("*",function(req,res){
  //res.sendFile(path + "views/404.html");
res.send('NO DISPONIBLE');
});

app.listen(PORT, function () {
  console.log('Servidor iniciado en el puerto ' + String(PORT));
})

