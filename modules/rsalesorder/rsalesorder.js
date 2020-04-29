const { BaseModule }=require('../../core');
const { __extends }=require('tslib');
const CollecReader=require('./collec-reader');
const Audit=require('../../utils/audit');
const Log=require('../../utils/log');
const XmlFile=require('../../utils/xml-file');
var Sequelize = require("sequelize");
var moment = require('moment');
const Op = Sequelize.Op

/**
 * 
 * @see 
 * @since Tue October 01, 2019 05:24 PM.
 * @author nandha.viswanathan@sifycorp.com 
 */
 var rSalesOrder=(function(){
 	__extends(rSalesOrder,BaseModule);
 	function rSalesOrder(xmljs){
 		BaseModule.call(this,xmljs);
 	};
 	rSalesOrder.prototype.isFailure=false;
 	rSalesOrder.prototype.importAssoc=function(){
 		const dbconn=this.getDb();
 		const CrmEntity=dbconn.import('./../../models/crmentity');
 		const CrmEntitySeq=dbconn.import('./../../models/crmentityseq');
 		const rSalesOrder=dbconn.import('./../../models/rsalesorder');
 		const rSalesOrderCf=dbconn.import('./../../models/rsalesorder-cf');
 		const rSoProductRel=dbconn.import('./../../models/rso-productrel');
 		const VtigerTab=dbconn.import('./../../models/vtiger-tab');
 		const VtigerField=dbconn.import('./../../models/vtiger-field');
 		const CurrencyInfo=dbconn.import('./../../models/currency-info');
 		const RelModule=dbconn.import('./../../models/rel-module');
 		const Retailer=dbconn.import('./../../models/retailer');
 		const SubRetailer=dbconn.import('./../../models/sub-retailer');
 		const RecCustMaster=dbconn.import('./../../models/rec-cust-mas');
 		const Beat=dbconn.import('./../../models/beat');
 		const Salesman=dbconn.import('./../../models/salesman');
 		const XSeries=dbconn.import('./../../models/x-series');
 		
 		this.models['CrmEntity']=CrmEntity;
 		this.models['rSalesOrder']=rSalesOrder;
 		this.models['rSalesOrderCf']=rSalesOrderCf;
 		this.models['rSoProductRel']=rSoProductRel;
 		this.models['VtigerField']=VtigerField;
 		this.models['VtigerTab']=VtigerTab;
 		this.models['CurrencyInfo']=CurrencyInfo;
 		this.models['RelModule']=RelModule;
 		this.models['Retailer']=Retailer;
 		this.models['SubRetailer']=SubRetailer;
 		this.models['RecCustMaster']=RecCustMaster;
 		this.models['Salesman']=Salesman;
 		this.models['Beat']=Beat;
 		this.models['XSeries']=XSeries;
 		this.models['CrmEntitySeq']=CrmEntitySeq;
 		return this;
 	};
 	rSalesOrder.prototype.import=async function(xml,xmlFile){
 		try{
 			
 			var xmlf=new XmlFile();
 			xmlf.setLog(this.getLog());
 			xmlf.basedir='./public/uploads';
 			xmlf.module='xrSalesOrder';

 			xmlf.fileName=moment().format('YYYYMMDDHHmmss.SSS');
 			xmlf.date=moment().format('YYYY-MM-DD');
 			xmlf.logDir();
 			var log_path=xmlf.getLogDir();
 			this.saveXml(xml,'xrSalesOrder');
 			this.importAssoc();
 			
 			var dbconn=this.getDb();
 			var crdr=new CollecReader(this._xmljs);
 			var log=new Log(log_path+'/'+crdr.transactionId()+'-'+moment().format('HHmmss.SSS')+'-log.log');
 			log.setLogger();
 			log.info("=========================RSO Start==================")
 			log.info("Module Name: xrSalesOrder");
 			log.info("XML File : "+xmlFile);
 			var audit=new Audit();
 			audit.docName=crdr.transactionId();
 			audit.distCode=crdr.fromId();
 			audit.options="Receive";
 			audit.source=crdr.sourceApplication();
 			audit.docCreatedDate=crdr.createdDate();
 			audit.destination=crdr.destApplication();
 			audit.docType=crdr.docType();
 			log.info("************* Document Information - start ***************");
 			log.info("TransactionId: "+crdr.transactionId());
 			log.info("fromId: "+crdr.fromId());
 			log.info("prkey: "+crdr.prkey());
 			log.info("docType: "+crdr.docType());
 			log.info("************* Document Information - end ***************");


 			var rSalesOrder=this.models['rSalesOrder'];
 			var rSalesOrderCf=this.models['rSalesOrderCf'];
 			var VtigerField=this.models['VtigerField'];
 			var VtigerTab=this.models['VtigerTab'];
 			var CurrencyInfo=this.models['CurrencyInfo'];
 			var RelModule=this.models['RelModule'];
 			var Retailer=this.models['Retailer'];
 			var SubRetailer=this.models['SubRetailer'];
 			var RecCustMaster=this.models['RecCustMaster'];
 			var Beat=this.models['Beat'];
 			var Salesman=this.models['Salesman'];
 			var XSeries=this.models['XSeries'];
 			log.info("************* Transaction -vtiger_xrso- start ***************");

 			var fields=await this.getFields(log);
 			var baseColl=await crdr.xrso();
 			var LBL_AUTO_RSO_TO_SO=await this.getInvMgtConfig('LBL_AUTO_RSO_TO_SO');
 			var LBL_RSO_SUB_RETAILER_CONVERT= await this.getInvMgtConfig('LBL_RSO_SUB_RETAILER_CONVERT');
 			var self=this;
 			if(Object.getPrototypeOf( baseColl ) === Object.prototype){
 				var baseColls=[baseColl];
 			}
 			else{
 				var baseColls=baseColl;
 			}
 			await baseColls.reduce(async (promise, coll) => {
 				await promise;
 				const distributorId=coll.distributor_id._text;
 				const {rso, rsocf} = await self.prepareValues(coll,fields,audit,log,distributorId,crdr.prkey());
 				await dbconn.transaction().then(async (t) => {
 					return await rso.save({transaction: t,logging:(msg)=>{log.debug(msg);}}).then(async (so) => {
 						return await rsocf.save({transaction:t,logging:(msg)=>{log.debug(msg);}}).then(async (socf)=>{
 							if(t.commit()){
 								log.info("============ Related Modules: Bill Ads, Ship Ads ===============")
 								await self.updateBillShipAds(socf.salesorderid,log);
 								await self.save(socf.salesorderid,log);
 								log.info("************* Transaction -vtiger_xrso- end ***************");
 								log.info("*********************** vtiger_xrso - lineItems update start **************")
 								await self.updateLineItems(so,audit,coll.lineitems,log);
 								log.info("****************** vtiger_xrso lineitems update -end *********************")
 								if(LBL_AUTO_RSO_TO_SO.toLowerCase()=='true' && LBL_RSO_SUB_RETAILER_CONVERT.toLowerCase()=='true' && Number(so.customer_type)!=2){
 									log.info('LBL_AUTO_RSO_TO_SO : '+LBL_AUTO_RSO_TO_SO);
 									log.info('LBL_RSO_SUB_RETAILER_CONVERT : '+LBL_RSO_SUB_RETAILER_CONVERT);
 									log.info("*********** RSO to SO conversion start ************")
 									await self.autoRsoToSo(so,socf,distributorId,log);	
 									log.info("*********** RSO to SO conversion end ***************")
 								}

 							}
 						});
 					}).then(async (t) => {

 					}).catch(async (err) => {
 						audit.statusCode='FN2010';
 						audit.statusMsg=err.message;
 						audit.reason=err.message;
 						audit.status='Failed';
 						audit.subject=rso.subject;
 						audit.saveLog(dbconn,log);
 						self.isFailure=true;
 						return await t.rollback();
 					});
 				});

 			}, Promise.resolve());

 			log.info("=========================RSO End==================")
 		}
 		catch(e){
 			
 			return  Promise.reject(e);
 		}
 		
 		return Promise.resolve(this.updateStatus(self.isFailure));

 	};
 	rSalesOrder.prototype.prepareValues=async function(coll,fields,audit,log,distId,prkey){
 		var self=this;
 		var dbconn=this.getDb();
 		const rSalesOrder=dbconn.import('./../../models/rsalesorder');
 		const rSalesOrderCf=dbconn.import('./../../models/rsalesorder-cf');
 		const CurrencyInfo=dbconn.import('./../../models/currency-info');
 		var rso=new rSalesOrder();
 		var rsocf=new rSalesOrderCf();
 		var salesorderid=await self.getCrmEntity('xrSalesOrder',log);
 		log.info("CrmEntity last inserted ID used as salesorderid: "+salesorderid)
 		rso.salesorderid=salesorderid;
 		rsocf.salesorderid=salesorderid;
 		await fields.reduce(async (promise, field) => {
 			await promise;

 			switch(field.uitype){
 				case 117:
 				log.info("=========== Related Module: Currency ================")
 				await CurrencyInfo.findOne({
 					where:{currency_code:coll.currency_id.currency_code._text},
 					logging:(msg)=>{
 						log.info("currency code: "+coll.currency_id.currency_code._text);
 						log.debug(msg);
 					}
 				}).then(currency=>{
 					log.info(field.columnname+" : "+currency.id+" type of data :" +field.typeofdata+" ui type : " +field.uitype);
 					rso[field.columnname]=currency.id;
 					rsocf[field.columnname]=currency.id;

 				}).catch(e=>{
 					throw new Error('Unable to get the currency id for sales order');
 				});
 				break;
 				case 10:
 			 	 //default related module for buyerid is xRetailer
 			 	 switch(field.columnname){
 			 	 	case 'buyerid':
 			 	 	log.info("=========== Related Module: Customer ================")
 			 	 	var buyerid=await self.getBuyerId(coll.customer_type._text,coll,log,distId,prkey);

 			 	 	if(buyerid){
 			 	 		log.info(field.columnname+" : "+buyerid+" type of data :" +field.typeofdata+" ui type : " +field.uitype);


 			 	 		rso[field.columnname]=buyerid;
 			 	 		rsocf[field.columnname]=buyerid;
 			 	 	}
 			 	 	else{
 			 	 		log.error("unable to get the buye id :"+buyerid);
 			 	 		audit.statusCode='FN8200';
 			 	 		audit.statusMsg="Due to Invalid data, we are unable to get the buyer id";
 			 	 		audit.reason="Error while getting the related module data";
 			 	 		audit.status='Failed';
 			 	 		audit.subject=coll.subject._text;
 			 	 		audit.saveLog(dbconn,log);
 			 	 		self.isFailure=true;
 			 	 	}
 			 	 	break;

 			 	 	case 'cf_xrso_beat':
 			 	 	log.info("=========== Related Module: Beat ================")

 			 	 	var beatId=await self.getBeat(coll,log,distId);
 			 	 	if(beatId){
 			 	 		log.info(field.columnname+" : "+beatId+" type of data :" +field.typeofdata+" ui type : " +field.uitype);
 			 	 		rso[field.columnname]=beatId;
 			 	 		rsocf[field.columnname]=beatId;
 			 	 	}
 			 	 	else{
 			 	 		log.error("Unable to get the beat info");
 			 	 		audit.statusCode='FN8216';
 			 	 		audit.statusMsg="Invalid Beat";
 			 	 		audit.reason="Error while getting the related module data";
 			 	 		audit.status='Failed';
 			 	 		audit.subject=coll.subject._text;
 			 	 		audit.saveLog(dbconn,log);
 			 	 		self.isFailure=true;
 			 	 	}
 			 	 	break;
 			 	 	case 'cf_xrso_sales_man':
 			 	 	log.info("=========== Related Module: Salesman ================")

 			 	 	try{
 			 	 		log.info(field.columnname+" : "+coll.cf_xrso_sales_man.salesmanid._text+" type of data :" +field.typeofdata+" ui type : " +field.uitype);
 			 	 		rso[field.columnname]= coll.cf_xrso_sales_man.salesmanid._text;
 			 	 		rsocf[field.columnname]= coll.cf_xrso_sales_man.salesmanid._text;
 			 	 	}
 			 	 	catch(e){
 			 	 		log.error("Unable to get the salesman info");
 			 	 		audit.statusCode='FN8210';
 			 	 		audit.statusMsg="Invalid Salesman code";
 			 	 		audit.reason="Error while getting the related module data";
 			 	 		audit.status='Failed';
 			 	 		audit.subject=coll.subject._text;
 			 	 		audit.saveLog(dbconn,log);
 			 	 		self.isFailure=true;
 			 	 	}

 			 	 	break;
 			 	 	case 'cf_salesorder_transaction_series':
 			 	 	log.info("=========== Related Module: Transaction series ================")

 			 	 	var transSeries=await self.getTransactionSeries(coll,log);
 			 	 	log.info(field.columnname+" : "+transSeries);  
 			 	 	rso[field.columnname]= transSeries;
 			 	 	rsocf[field.columnname]=transSeries;
 			 	 	break;

 			 	 }
 			 	 break;
 			 	 default:
	 		                         //console.log(field.columnname,'=>',coll[field.columnname]);
	 		                         if(field.typeofdata.includes('M')){
	 		                         	if(coll[field.columnname]!=='undefined' &&coll[field.columnname]!==null && Object.keys(coll[field.columnname]).length>0){
	 		                         		log.info(field.columnname+" : "+coll[field.columnname]._text+" typeof data: "+field.typeofdata+" ui type: "+field.uitype);
	 		                         		rso[field.columnname]= coll[field.columnname]._text;
	 		                         		rsocf[field.columnname]= coll[field.columnname]._text;
	 		                         	}
	 		                         	else{
	 		                         		log.error(ield.columnname+" is required");
	 		                         		audit.statusCode='FN8210';
	 		                         		audit.statusMsg=field.columnname+" is required";
	 		                         		audit.reason=field.columnname+" is required";
	 		                         		audit.status='Failed';
	 		                         		audit.subject=coll.subject._text;
	 		                         		audit.saveLog(dbconn,log);
	 		                         		self.isFailure=true;
	 		                         	} 
	 		                         }
	 		                         else{
	 		                         	if(field.columnname!='crmid' && field.columnname!='cf_xrso_type'){

	 		                         		if(coll[field.columnname]!=='undefined' &&coll[field.columnname]!==null && Object.keys(coll[field.columnname]).length>0){
	 		                         			log.info(field.columnname+" : "+coll[field.columnname]._text+" typeof data: "+field.typeofdata+" ui type: "+field.uitype);
	 		                         			rso[field.columnname]= coll[field.columnname]._text;
	 		                         			rsocf[field.columnname]= coll[field.columnname]._text;
	 		                         		} 
	 		                         	}
	 		                         }
	 		            /*if(field.columnname!='crmid' && field.columnname!='cf_xrso_type'){

	 		                if(coll[field.columnname]!=='undefined' &&coll[field.columnname]!==null && Object.keys(coll[field.columnname]).length>0){
	 		                	log.info(field.columnname+" : "+coll[field.columnname]._text+" typeof data: "+field.typeofdata);
	 		                	rso[field.columnname]= coll[field.columnname]._text;
	 		                    rsocf[field.columnname]= coll[field.columnname]._text;
	 		                   } 
	 		               }*/
	 		               break;
	 		           }



	 		       }, Promise.resolve());

return {rso:rso,rsocf: rsocf}; 
}

rSalesOrder.prototype.getFields=async function (log){
	const dbconn=this.getDb();
	const VtigerField=dbconn.import('./../../models/vtiger-field');
	const rSalesOrder=dbconn.import('./../../models/rsalesorder');
	const VtigerTab=dbconn.import('./../../models/vtiger-tab')
	log.info("Module table Names: "+rSalesOrder.tableName+","+rSalesOrder.tableName+'cf');
	return VtigerField.findAll({
		where:{
			tablename:[rSalesOrder.tableName,rSalesOrder.tableName+'cf'],xmlreceivetable:1},
			attributes: ['fieldid','columnname','typeofdata','uitype','tabid'],
			include:[{model:VtigerTab,required:true,attributes:['tabid','name']}],
			logging:(msg)=>{
				log.debug(msg);
			}
		}).then(fields => {
			return fields;
		}).catch(e=>{
			return e.error;
		});
	}
	rSalesOrder.prototype.getTransGridFields=async function (tableName,log){
		log.info("======== Related Module: sify_tr_grid_field ================")
		const dbconn=this.getDb();
		const XGridField=dbconn.import('./../../models/x-grid-field');

		return XGridField.findAll({
			where:{
				tablename:tableName,xmlreceivetable:1},
				attributes: ['columnname'],
				logging:(msg)=>{
					log.debug(msg);
				}
			}).then(fields => {
				return fields;
			}).catch(e=>{

				return e.error;
			});
		}
		rSalesOrder.prototype.updateBillShipAds=async function (soId,log){
			const dbconn=this.getDb();
			const RsoBillAds=dbconn.import('./../../models/rso-bill-ads');
			const RsoShipAds=dbconn.import('./../../models/rso-ship-ads');

			var rsoBillAds=new RsoBillAds();
			rsoBillAds['sobilladdressid']=soId;
			rsoBillAds.save({logging:(msg)=>{log.debug(msg)}}).then().catch(e=>{
				console.log(e);
			});
			var rsoShipAds=new RsoShipAds();
			rsoShipAds['soshipaddressid']=soId;
			rsoShipAds.save({logging:(msg)=>{log.debug(msg)}}).then().catch(e=>{
				console.log(e);
			});
			return true;
		}
		rSalesOrder.prototype.getTransRel=async function(log){
			log.info("======== Related Module: sify_tr_rel ======================")
			const dbconn=this.getDb();
			const TransRel=dbconn.import('./../../models/trans-rel');
			return TransRel.findOne({
				where:{'transaction_name':'xrSalesOrder'},
				attributes:['transaction_rel_table','profirldname','relid','uom','categoryid','receive_pro_by_cate'],
				logging:(msg)=>{
					log.debug(msg);
				}
			}).then(relation=>{
				return relation;
			}).catch(e=>{

				throw new Error("Unable to get the tranaction related information");
			});
		}

		rSalesOrder.prototype.getBeat=async function(coll,log,distId){
			var dbconn=this.getDb();
			const Beat=dbconn.import('./../../models/beat');
			return Beat.findOne({
				where:{beatcode:coll.cf_xrso_beat.beatcode._text,deleted:0,cf_xbeat_distirbutor_id:distId},
				attributes:['xbeatid'],
				logging:(msg)=>{
					log.debug(msg);
				}
			}).then(beat=>{
				if(beat){
					return beat.xbeatid;
				}
				else{
					return false;
				}

			}).catch(e=>{
				return false;
			});
		}
		rSalesOrder.prototype.getInvMgtConfig=async function(key){
			var dbconn=this.getDb();
			const InvMgtConfig=dbconn.import('./../../models/inv-mgt-config');
			return InvMgtConfig.findOne({
				where:{key:key,treatment:'sap'},
				attributes:['value']
			}).then(config=>{
				if(config){
					return config.value;
				}
				else{
					return false;
				}

			}).catch(e=>{
				return false;
			});
		}
		rSalesOrder.prototype.getProductTrackSerial=async function (productId,log){

			var dbconn=this.getDb();
			const Product=dbconn.import('./../../models/product');
			return Product.findOne({
				where:{xproductid:productId},
				attributes:['track_serial_number'],
				logging:(msg)=>{
					log.debug(msg);
				}
			}).then(product=>{
				if(product){
					if(product['track_serial_number'].toLowerCase()=='yes'){
						return 1;
					}
					else{
						return 0;
					}
				}
				else{
					return 0;
				}

			}).catch(e=>{
				return 0;
			});

		}
		rSalesOrder.prototype.getProductId=async function(productCode,log){
			var dbconn=this.getDb();
			const Product=dbconn.import('./../../models/product');
			return Product.findOne({
				where:{productcode:productCode},
				attributes:['xproductid'],
				logging:(msg)=>{
					log.debug(msg);
				}
			}).then(product=>{
				if(product){
					return product.xproductid;
				}
				else{
					return false;
				}

			}).catch(e=>{
				return false;
			});
		}
		rSalesOrder.prototype.getUomId=async function(uomName,log){
			var dbconn=this.getDb();
			const Uom=dbconn.import('./../../models/uom');
			return Uom.findOne({
				where:{uomname:uomName},
				attributes:['uomid'],
				logging:(msg)=>{
					log.debug(msg);
				}
			}).then(uom=>{
				if(uom){
					return uom.uomid;
				}
				else{
					return false;
				}

			}).catch(e=>{
				return false;
			});
		}
		rSalesOrder.prototype.trash=function(soId,log){
			var dbconn=this.getDb();
			const CrmEntity=dbconn.import('./../../models/crmentity');
			const rSalesOrder=dbconn.import('./../../models/rsalesorder');
			const rSalesOrderCf=dbconn.import('./../../models/rsalesorder-cf');
			const XrsoProdRel=dbconn.import('./../../models/xrso-prod-rel');
			CrmEntity.update(
				{modified_at: moment().format('YYYY-MM-DD HH:mm:ss'),deleted:1},
				{where: {crmid:soId},logging:(msg)=>{
					log.debug(msg);
				}}
				).then().catch();
			rSalesOrder.update(
				{modified_at: moment().format('YYYY-MM-DD HH:mm:ss'),deleted:1},
				{where: {salesorderid:soId},logging:(msg)=>{
					log.debug(msg);
				}}
				).then().catch();
			rSalesOrderCf.update(
				{modified_at: moment().format('YYYY-MM-DD HH:mm:ss'),deleted:1},
				{where: {salesorderid:soId},logging:(msg)=>{
					log.debug(msg);
				}}
				).then().catch();

			XrsoProdRel.update(
				{modified_at: moment().format('YYYY-MM-DD HH:mm:ss'),deleted:1},
				{where: {id:soId},logging:(msg)=>{
					log.debug(msg);
				}}
				).then().catch();


		}
		rSalesOrder.prototype.save=async function(soId,log){

			var dbconn=this.getDb();
			const CrmEntity=dbconn.import('./../../models/crmentity');
			const rSalesOrder=dbconn.import('./../../models/rsalesorder');
			const rSalesOrderCf=dbconn.import('./../../models/rsalesorder-cf');
			const XrsoProdRel=dbconn.import('./../../models/xrso-prod-rel');
			const rsoBillAds=dbconn.import('./../../models/rso-bill-ads');
			const rsoShipAds=dbconn.import('./../../models/rso-ship-ads');

			CrmEntity.update(
			{
				modified_at: moment().format('YYYY-MM-DD HH:mm:ss'),
				created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
				deleted:0},
				{where: 
					{crmid:soId}},
					{logging:(msg)=>{
						log.debug(msg);
					}}
					).then().catch();
			rSalesOrder.update(
			{
				modified_at: moment().format('YYYY-MM-DD HH:mm:ss'),
				created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
				deleted:0},
				{where: {salesorderid:soId}},
				{logging:(msg)=>{
					log.debug(msg);
				}}
				).then().catch();
			rSalesOrderCf.update(
			{
				modified_at: moment().format('YYYY-MM-DD HH:mm:ss'),
				created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
				deleted:0},
				{where: {salesorderid:soId}},
				{logging:(msg)=>{
					log.debug(msg);
				}}
				).then().catch();

			XrsoProdRel.update(
				{modified_at: moment().format('YYYY-MM-DD HH:mm:ss'),deleted:1},
				{where: {id:soId}},
				{logging:(msg)=>{
					log.debug(msg);
				}}
				).then().catch();
			rsoBillAds.update(
			{
				modified_at: moment().format('YYYY-MM-DD HH:mm:ss'),
				created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
				deleted:0},
				{where: {sobilladdressid:soId}},
				{logging:(msg)=>{
					log.debug(msg);
				}}
				).then().catch();
			rsoShipAds.update(
			{
				modified_at: moment().format('YYYY-MM-DD HH:mm:ss'),
				created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
				deleted:0},
				{where: {soshipaddressid:soId}},
				{logging:(msg)=>{
					log.debug(msg);
				}}
				).then().catch();		
		}
		rSalesOrder.prototype.updateSubject= function(soId,subject,log){
			var dbconn=this.getDb();
			const rSalesOrder=dbconn.import('./../../models/rsalesorder');
			rSalesOrder.update(
			{
				subject:subject
			},
			{where: {salesorderid:soId}},
			{logging:(msg)=>{
				log.debug(msg);
			}}
			).then().catch();

		}
		rSalesOrder.prototype.update=function(soId){
			var dbconn=this.getDb();
			const CrmEntity=dbconn.import('./../../models/crmentity');
			const rSalesOrder=dbconn.import('./../../models/rsalesorder');
			const rSalesOrderCf=dbconn.import('./../../models/rsalesorder-cf');
			const XrsoProdRel=dbconn.import('./../../models/xrso-prod-rel');
			CrmEntity.update(
			{
				modified_at: moment().format('YYYY-MM-DD HH:mm:ss'),
				deleted:0},
				{where: 
					{crmid:soId}}
					).then().catch();
			rSalesOrder.update(
			{
				modified_at: moment().format('YYYY-MM-DD HH:mm:ss'),
				deleted:0},
				{where: {salesorderid:soId}}
				).then().catch();
			rSalesOrderCf.update(
			{
				modified_at: moment().format('YYYY-MM-DD HH:mm:ss'),
				deleted:0},
				{where: {salesorderid:soId}}
				).then().catch();

			XrsoProdRel.update(
				{modified_at: moment().format('YYYY-MM-DD HH:mm:ss'),deleted:1},
				{where: {id:soId}}
				).then().catch();		
		}
		rSalesOrder.prototype.getTransactionSeries=async function(coll,log){
			var dbconn=this.getDb();
			const XSeries=dbconn.import('./../../models/x-series');
			return XSeries.findOne({
				where:{transactionseriescode:coll.cf_salesorder_transaction_series.transactionseriescode._text,
					deleted:0,
					xdistributorid:coll.distributor_id._text,
					logging:(msg)=>{
						log.debug(msg)
					}
				},
				attributes:['xtransactionseriesid']
			}).then(series=>{
				if(series){
					return series.xtransactionseriesid;
				}
				else{
					return '';

				}

			}).catch(e=>{
				return '';

			});
		}
		rSalesOrder.prototype.getXrsoProdRel=async function(soId){
			try{
				var dbconn=this.getDb();
				const rSoProductRel=dbconn.import('./../../models/rso-productrel');
				return rSoProductRel.findAll({
					where:{id:soId}
				}).then(prodRel=>{
					return prodRel;
				}).catch(e=>{
					return false;
				});
			}catch(e){
				return false;
			}
		}

		rSalesOrder.prototype.getBuyerId=async function(customerType,coll,log,distId,prkey){
			var dbconn=this.getDb();
			const Retailer=dbconn.import('./../../models/retailer');
			const SubRetailer=dbconn.import('./../../models/sub-retailer');
			const RecCustMaster=dbconn.import('./../../models/rec-cust-mas');
			log.info("Customer type: "+ customerType)
			switch(customerType){
				case '1':
				log.info("=========== Related sub-module: ReceiveCustomerMaster ================")
				return  RecCustMaster.findOne({
					where:{customercode:coll.buyerid.customercode._text,deleted:0,distributor_id:distId},
					attributes:['xreceivecustomermasterid'],
					logging:(msg)=>{
						log.debug(msg);
					}
				}).then(retailer=>{
					if(retailer){
						return retailer.xreceivecustomermasterid;
					}
					else{
						return false;
					}
				}).catch(e=>{
					return false;
				});
				break;
				case '2':
				log.info("=========== Related sub-module: SubRetailer ================")
				return await SubRetailer.findOne({
					where:{customercode:coll.buyerid.customercode._text,deleted:0,distributor_id:distId},
					attributes:['xsubretailerid'],
					logging:(msg)=>{
						log.debug(msg);
					}
				}).then(subretailer=>{

					if(subretailer){

						return subretailer.xsubretailerid;
					}
					else{

						return false;
					}
				}).catch(e=>{
					log.error(e.message);
					return false;
				});
				break;
				case '0':
				log.info("=========== Related sub-module: Retailer ================")
				if(prkey.includes('unique_retailer_code')){
					return Retailer.findOne({
						where:{unique_retailer_code:coll.buyerid.unique_retailer_code._text,deleted:0,distributor_id:distId},
						attributes:['xretailerid'],
						logging:(msg)=>{
							log.debug(msg);
						}
					}).then(retailer=>{
						if(retailer){
							return retailer.xretailerid;
						}
						else{
							return false;
						}
					}).catch(e=>{
						return false;
					});	
				}
				else{
					return Retailer.findOne({
						where:{customercode:coll.buyerid.customercode._text,deleted:0,distributor_id:distId},
						attributes:['xretailerid'],
						logging:(msg)=>{
							log.debug(msg);
						}
					}).then(retailer=>{
						if(retailer){
							return retailer.xretailerid;
						}
						else{
							return false;
						}
					}).catch(e=>{
						return false;
					});
					
				}


			}
		}

		rSalesOrder.prototype.updateLineItems=async function(so,audit,coll,log){



			var self=this;
			var dbconn=this.getDb();
			const XrsoProdRel=dbconn.import('./../../models/xrso-prod-rel');
			var transRel=await self.getTransRel(log);
			var transGridFields=await self.getTransGridFields(transRel.transaction_rel_table,log);
			if(Object.getPrototypeOf( coll[transRel.transaction_rel_table]) === Object.prototype){

				var lineItems=[coll[transRel.transaction_rel_table]]
			}
			else{
				var lineItems=coll[transRel.transaction_rel_table];
			}

			var LBL_RSO_SAVE_PRO_CATE= await self.getInvMgtConfig('LBL_RSO_SAVE_PRO_CATE');
			var LBL_VALIDATE_RPI_PROD_CODE= await self.getInvMgtConfig('LBL_VALIDATE_RPI_PROD_CODE');
			var is_process=((LBL_RSO_SAVE_PRO_CATE.toLowerCase()=='true' && transRel.receive_pro_by_cate.toLowerCase()=='true'))?0:1;

			lineItemsIteration:
			for (var i = 0; i < lineItems.length; i++) {

				var lineItem=lineItems[i];
				transGridFieldsIteration:
				var xrsoProdRel=new XrsoProdRel();
				xrsoProdRel['created_at']=moment().format('YYYY-MM-DD HH:mm:ss');
				xrsoProdRel['modified_at']=moment().format('YYYY-MM-DD HH:mm:ss');

				for (var j = 0; j < transGridFields.length; j++) {
					var field=transGridFields[j];

					switch(field.columnname){
						case transRel.relid :
						xrsoProdRel[transRel.relid]=so.salesorderid;
						break;
						case transRel.categoryid :

						break;
						case transRel.profirldname :
						if(is_process==1){
							log.info("====== product details ==============")
							var productId=await self.getProductId(lineItem.productcode._text,log);
							if(productId==false){
								if(LBL_VALIDATE_RPI_PROD_CODE.toLowerCase()=='true'){
									audit.statusCode='FN8212';
									audit.statusMsg="Invalid Product Code "
									audit.reason="Product Is Not Availabale with provided input"+lineItem.productcode._text;
									audit.status='Failed';
									audit.subject=so.subject;
									audit.saveLog(dbconn,log);
									self.trash(so.salesorderid,log);
									self.updateSubject(so.salesorderid,so.subject+'_'+so.salesorderid,log);
									self.isFailure=true;
									continue lineItemsIteration;
								}
								else{
									xrsoProdRel['productname']='0';
									xrsoProdRel['productcode']=lineItem.productcode._text;
									xrsoProdRel[transRel.profirldname]=productId;
								}
							}
							else{
								xrsoProdRel['productname']=productId;
								xrsoProdRel[transRel.profirldname]=productId;
								xrsoProdRel['productcode']=lineItem.productcode._text;
							}
						}
						break;
						case transRel.uom :
						if(is_process==1){
							log.info("====== uom details ==============")
							var uomId=await self.getUomId(lineItem.tuom.uomname._text,log);
							if(uomId==false){
								audit.statusCode='FN8213';
								audit.statusMsg="Invalid UOM - "+lineItem.tuom.uomname._text;
								audit.reason="UOM Is Not Availabale with provided input "+lineItem.tuom.uomname._text;
								audit.status='Failed';
								audit.subject=so.subject;
								audit.saveLog(dbconn,log);
								self.trash(so.salesorderid,log);
								self.updateSubject(so.salesorderid,so.subject+'_'+so.salesorderid,log);
								self.isFailure=true;
								continue lineItemsIteration;

							}else{
								var isProdUomMapped= await self.isProdUomMap(xrsoProdRel['productid'],uomId,log);
								if(!isProdUomMapped){

									if(LBL_VALIDATE_RPI_PROD_CODE.toLowerCase() == 'true'){
										audit.statusCode='FN8218';
										audit.statusMsg= "product id :"+ productId+" & uom id: "+uomId+" are Not Mapped";
										audit.reason= "product id :"+ productId+" & uom id: "+uomId+" are Not Mapped";
										audit.status='Failed';
										audit.subject=so.subject;
										audit.saveLog(dbconn,log);
										self.trash(so.salesorderid,log);
										self.updateSubject(so.salesorderid,so.subject+'_'+so.salesorderid,log);
										self.isFailure=true;
										continue lineItemsIteration;

									}	
								}
								xrsoProdRel[transRel.uom]=uomId;
							}
						}

						break;
						case 'tax1' :
						try{
							var tax1=lineItem.tax1._text;
							xrsoProdRel['tax1']=tax1
							log.info("tax1: "+tax1);
						}
						catch(e){
							xrsoProdRel['tax1']='0';
						}
						xrsoProdRel['tax2']='0';
						xrsoProdRel['tax3']='0';
						break;

						case 'quantity' :
						try{
							var quantity=Number(lineItem.quantity._text);
							if(quantity>0){
								log.info("quantity: "+ quantity);
								xrsoProdRel['quantity']=quantity;
							}
							else{
								log.error("Invalid Quantity");
								audit.statusCode='FN8213';
								audit.statusMsg="Invalid Quantity";
								audit.reason="quantity Is Not Availabale";
								audit.status='Failed';
								audit.subject=so.subject;
								audit.saveLog(dbconn,log);
								self.trash(so.salesorderid,log);
								self.updateSubject(so.salesorderid,so.subject+'_'+so.salesorderid,log);
								self.isFailure=true;
								continue lineItemsIteration;
							}
						}catch(e){
							log.error("Invalid Quantity");
							audit.statusCode='FN8214';
							audit.statusMsg="Invalid Quantity";
							audit.reason="quantity Is Not Availabale";
							audit.status='Failed';
							audit.subject=so.subject;
							audit.saveLog(dbconn,log);
							self.trash(so.salesorderid,log);
							self.updateSubject(so.salesorderid,so.subject+'_'+so.salesorderid,log);
							self.isFailure=true;
							continue lineItemsIteration;
						}
						break;
						case 'baseqty':
						try{
							xrsoProdRel['baseqty']=lineItem.baseqty._text;
						}
						catch(e){

							xrsoProdRel['baseqty']=Number(lineItem.quantity._text);
						}


						break;
						default:
						try{
							if(lineItem[field.columnname]!=='undefined' && lineItem[field.columnname]!==null && Object.keys(lineItem[field.columnname]).length>0){
								log.info(field.columnname+" : "+lineItem[field.columnname]._text);
								xrsoProdRel[field.columnname]=lineItem[field.columnname]._text;
							}
						}
						catch(e){

						}
						break;
					}
				}

				xrsoProdRel.save({logging:(msg)=>{
					log.debug(msg);
				}}).then(res=>{

				}).catch(e=>{
					self.isFailure=true;
				});

			}

			return Promise.resolve(true);


		}
		rSalesOrder.prototype.isProdUomMap=async function(productId,uomId,log){
			var self=this;
			const dbconn=this.getDb();
			const Product=dbconn.import('./../../models/product');
			const ProductCf=dbconn.import('./../../models/product-cf');
			var prodUomFields=await self.getProductUomFields('vtiger_xproduct');
			var prodUomCusFields=await self.getProductUomFields('vtiger_xproductcf');
			log.info("========== checking if the product and uom mapped ================")
			return ProductCf.findOne({
				where:{
					xproductid:productId,
				},
				attributes:prodUomCusFields,
				include:[{model:Product,required:true,attributes:prodUomFields}],
				raw: true,
				logging:(msg)=>{
					log.debug(msg)
				}
			}).then(uoms => {
				return Object.values(uoms).includes(uomId);
			}).catch(e=>{
				return false;
			});


		}
		rSalesOrder.prototype.getProductUomFields=async function(tableName){
			const dbconn=this.getDb();
			const VtigerField=dbconn.import('./../../models/vtiger-field');

			return VtigerField.findAll({
				where:{
					tablename:tableName,
					presence:[0,2],
					typeofdata:{[Op.like]:'%UOM%'}
				},
				attributes: ['columnname'],
				raw: true,
			}).then(fields => {
				var uoms=fields.map((uom)=>{
					return uom.columnname;
				});
				return uoms;
			}).catch(e=>{
				return e.error;
			});

		}
		rSalesOrder.prototype.autoRsoToSo=async function(rso,rsocf,distId,log){
			try{
				var self=this;
				const dbconn=this.getDb();
				var LBL_SET_NETRATE=self.getInvMgtConfig('LBL_SET_NETRATE');
				var ALLOW_GST_TRANSACTION=self.getInvMgtConfig('ALLOW_GST_TRANSACTION');
				var SO_LBL_TAX_OPTION_ENABLE=self.getInvMgtConfig('SO_LBL_TAX_OPTION_ENABLE');
				var SO_LBL_CURRENCY_OPTION_ENABLE=self.getInvMgtConfig('SO_LBL_CURRENCY_OPTION_ENABLE');
				var isSoConverted=await self.isSoConverted(rso.salesorderid,log);
				log.info("isSoConverted : "+isSoConverted);
				if(isSoConverted){
					rsocf.cf_xrso_next_stage_name='';
					rsocf.save({logging:(msg)=>{
						log.debug(msg);
					}});
					rso.status='Processed';
					rso.is_processed=2;
					rso.save({logging:(msg)=>{
						log.debug(msg);
					}});
					return true;
				}
				var convertToSo = false;
				var nextStage= await self.getStageAction('Create SO',log);
				if(nextStage.cf_workflowstage_business_logic=='Forward to SO'){
					convertToSo=true;
				}
				if(!convertToSo){
					rsocf.cf_xrso_next_stage_name=nextStage.cf_workflowstage_next_stage;
					rsocf.save({logging:(msg)=>{
						log.debug(msg);
					}});
					rso.status=nextStage.cf_workflowstage_next_content_status;
					rso.save({logging:(msg)=>{
						log.debug(msg);
					}});
					return true;
				}

				var salesOrderId=await self.getCrmEntity('xSalesOrder',log);
 			//get Salesorder Object 
 			log.info("xSalesOrder crmentity id :"+salesOrderId)
 			var {so,socf,soBillAds,soShipAds}= await self.prepareSo(salesOrderId,rso,rsocf,distId,log);
 			
 			so.save({logging:(msg)=>{
 				log.debug(msg);
 			}}).then(async function(so){

 				socf.save({logging:(msg)=>{
 					log.debug(msg);
 				}}).then(async function(socf){
 					await self.updateCrmRelEntity(rso['salesorderid'],'xrSalesOrder',so['salesorderid'],'xSalesOrder',log);
 					await self.updateSoLineItems(so,socf,rso.salesorderid,distId,log);
 				}).catch(e=>{
 					
 				});
 			}).catch(e=>{
 				
 			});
 			
 			soBillAds.save({logging:(msg)=>{
 				log.debug(msg);
 			}}).then().catch(e=>{
 				
 			});
 			soShipAds.save({logging:(msg)=>{
 				log.debug(msg);
 			}}).then().catch(e=>{
 				
 			});
 			return true;
 			
 		}catch(e){
 			return false;
 		}
 	}
 	rSalesOrder.prototype.updateCrmRelEntity=async function(crmId,module,relCrmId,relModule,log){
 		var self=this;
 		const dbconn=this.getDb();
 		const CrmEntityRel=dbconn.import('./../../models/crmentity-rel');
 		var crmEntityRel=new CrmEntityRel();
 		crmEntityRel['crmid']=crmId;
 		crmEntityRel['module']=module;
 		crmEntityRel['relcrmid']=relCrmId;
 		crmEntityRel['relmodule']=relModule;
 		crmEntityRel.save({logging:(msg)=>{
 			log.debug(msg);
 		}});
 		return true;
 	}
 	rSalesOrder.prototype.updateSoLineItems=async function(so,socf,rsoId,distId,log){
 		try{
 			var self=this;
 			const dbconn=this.getDb();
 			const SoProdRel=dbconn.import('./../../models/so-prod-rel');
 			const SaleXBatchInfo=dbconn.import('./../../models/sale-x-batch-info');
 			var xrsoProdLineItems=await self.getXrsoProdRel(rsoId);
 			var i=1;
 			await xrsoProdLineItems.reduce(async (promise, item) => {
 				await promise;
 				var soProdRel=new SoProdRel();
 				soProdRel['id']=so['salesorderid'];
 				soProdRel['productid']=item['productid'];
 				soProdRel['productcode']=item['productcode'];
 				soProdRel['sequence_no']=i;
 				soProdRel['quantity']=item['quantity'];
 				soProdRel['siqty']=item['siqty'];
 				soProdRel['tuom']=item['tuom'];
 				soProdRel['discount_percent']=item['discount_percent'];
 				soProdRel['xprodhierid']=item['xprodhierid'];
 				soProdRel['discount_amount']=item['discount_amount'];
 				soProdRel['baseqty']=item['baseqty'];
 				soProdRel['dispatchqty']=item['dispatchqty'];
 				soProdRel['listprice']=item['listprice'];
 				soProdRel['comment']=item['comment'];
 				soProdRel['description']=item['description'];
 				soProdRel['incrementondel']=item['incrementondel'];
 				soProdRel['tax1']=item['tax1'];
 				soProdRel['tax2']=item['tax2'];
 				soProdRel['tax3']=item['tax3'];
 				soProdRel['ptr']=item['ptr'];
 				soProdRel['mrp']=item['mrp'];
 				soProdRel['deleted']=0;
 				soProdRel.created_at=moment().format('YYYY-MM-DD HH:mm:ss');
 				soProdRel.modified_at=moment().format('YYYY-MM-DD HH:mm:ss');

 				soProdRel.save({logging:(msg)=>{
 					log.debug(msg);
 				}}).then(async function(soRel){
 					
 					var sxbinfo=new SaleXBatchInfo();
 					sxbinfo['transaction_id']=soRel['id'];
 					sxbinfo['trans_line_id']=soRel['lineitem_id'];
 					sxbinfo['product_id']=soRel['productid'];
 					sxbinfo['pkd']='';
 					sxbinfo['expiry']='';
 					sxbinfo['transaction_type']='SO';
 					sxbinfo['sqty']=soRel['quantity'];
 					sxbinfo['sfqty']=0.000000;
 					sxbinfo['ptr']=soRel['ptr'];
 					sxbinfo['pts']=0.000000;
 					sxbinfo['mrp']=0.000000;
 					sxbinfo['ecp']=0.000000;
 					sxbinfo['distributor_id']=distId;
 					var trackSerial=await self.getProductTrackSerial(soRel['productid'],log);
 					sxbinfo['track_serial']=trackSerial;
 					sxbinfo['created_at']=moment().format('YYYY-MM-DD HH:mm:ss');;
 					sxbinfo['modified_at']=moment().format('YYYY-MM-DD HH:mm:ss');;
 					sxbinfo['deleted']=0;
 					sxbinfo.save({logging:(msg)=>{
 						log.debug(msg);
 					}}).then(async function(sxBatchInfo){
 						await self.updateSoXRelInfo(so,socf,soRel,sxBatchInfo,distId,log);	
 					}).catch(e=>{

 					});
 				}).catch(e=>{
 					
 					return false;
 				});
 			}, Promise.resolve());
 		}catch(e){
 			return false;
 		}
 	}
 	rSalesOrder.prototype.updateSoXRelInfo=async function(so,socf,sorel,sxbinfo,distId,log){
 		var self=this;
 		const dbconn=this.getDb();
 		const ALLOW_GST_TRANSACTION=await self.getInvMgtConfig('ALLOW_GST_TRANSACTION');
 		if(ALLOW_GST_TRANSACTION){
 			var netTotal = 0;
 			if(Number(sorel['listprice']) > 0 && Number(sorel['quantity']) > 0){
 				netTotal=Number(sorel['listprice'])*Number(sorel['quantity']);
 			}
 			if(Number(sorel['discount_amount'])>0 && netTotal>=Number(sorel['discount_amount'])){
 				netTotal=netTotal-Number(sorel['discount_amount']);
 			}
 			if(Number(sorel['discount_percent'])>0 && netTotal>=Number(sorel['discount_percent']) && Number(sorel['discount_percent'])<100) {
 				netTotal=netTotal-(netTotal*(Number(sorel['discount_percent'])/100));
 			}
 			else if (Number(sorel['discount_percent'])>0 && Number(sorel['discount_percent'])>=100){
 				netTotal=netTotal-(netTotal*(Number(sorel['discount_percent'])/100));
 			}
 			so['total']=netTotal;
 			so['sub_total']=netTotal;
 			so.save({logging:(msg)=>{
 				log.debug(msg);
 			}});

 		}
 	}
 	rSalesOrder.prototype.prepareSo=async function(soId,rso,rsocf,distId,log){
 		var self=this;
 		const dbconn=this.getDb();
 		const SalesOrder=dbconn.import('./../../models/salesorder');
 		const SalesOrderCf=dbconn.import('./../../models/salesorder-cf');
 		
 		so=new SalesOrder();
 		so['salesorderid']=soId;
 		so['subject']=rso['subject'];
 		so['type']=rso['type'];
 		so['duedate']=rso['duedate'];
 		so['contactid']=rso['contactid'];
 		so['exciseduty']=rso['exciseduty'];
 		so['salescommission']=rso['salescommission'];
 		so['terms_conditions']=rso['terms_conditions'];
 		so['currency_id']=rso['currency_id'];
 		so['conversion_rate']=rso['conversion_rate'];
 		so['tracking_no']=rso['tracking_no'];
 		so['carrier']=rso['carrier'];
 		so['deleted']=0;
		//get the receive customer master - reference id for buyer id
		var buyerId=await self.getCustomerRefId(rso['buyerid'],log);
		log.info("Buyer Id in so :"+buyerId);
		if(buyerId==false || typeof(buyerId)=='undefined'|| buyerId=='undefined'){
			buyerId=rso['buyerid'];
			so['buyerid']=rso['buyerid'];
		}
		else{
			so['buyerid']=buyerId;
		}


		so['requisition_no']=rso['requisition_no'];
		so['tracking_no']=rso['tracking_no'];
		so['adjustment']=rso['adjustment'];
		so['total']=rso['total'];
		so['taxtype']=rso['taxtype'];
		so['discount_percent']=rso['discount_percent'];
		so['discount_amount']=rso['discount_amount'];
		so['s_h_amount']=rso['s_h_amount'];
		so['is_taxfiled']=0;
		var TAX_TYPE=await self.getInvMgtConfig('ALLOW_GST_TRANSACTION');
		so['trntaxtype']=(TAX_TYPE?'GST':'VAT');
		so['so_lbl_save_pro_cate']=await self.getInvMgtConfig('SO_LBL_SAVE_PRO_CATE');
		var soBillAds=await self.prepareBillAds(soId,buyerId,log);
		soBillAds['created_at']=moment().format('YYYY-MM-DD HH:mm:ss');
		soBillAds['modified_at']=moment().format('YYYY-MM-DD HH:mm:ss');
		soBillAds['deleted']=0;
		var soShipAds=await self.prepareShipAds(soId,buyerId,log);
		soShipAds['created_at']=moment().format('YYYY-MM-DD HH:mm:ss');
		soShipAds['modified_at']=moment().format('YYYY-MM-DD HH:mm:ss');
		soShipAds['deleted']=0;
 		//preparing the socf table 
 		var socf=new SalesOrderCf();
 		socf['salesorderid']=soId;
 		socf['cf_salesorder_sales_order_date']=rsocf['cf_salesorder_sales_order_date'];
 		socf['cf_xsalesorder_beat']=rsocf['cf_xrso_beat'];
 		socf['cf_xsalesorder_sales_man']=rsocf['cf_xrso_sales_man'];
 		if(typeof(rsocf['cf_xrso_credit_term'])==null || rsocf['cf_xrso_credit_term']=='' ||rsocf['cf_xrso_credit_term']==null){
 			var creditTerm=await self.getCreditTerm(rso['buyerid'],log);
 			socf['cf_xsalesorder_credit_term']=creditTerm;
 		}
 		
 		socf['cf_salesinvoice_beat']=rsocf['cf_xrso_beat'];
 		socf['cf_xsalesorder_billing_address_pick']=soBillAds.xaddressid;
 		socf['cf_xsalesorder_shipping_address_pick']=soShipAds.xaddressid;
 		var nextStage= await self.getStageAction('Submit',log);
 		socf['cf_xsalesorder_next_stage_name'] = nextStage.cf_workflowstage_next_stage;
 		so['status'] = nextStage.cf_workflowstage_next_content_status;
 		so['salesorder_status']='Open Order';
 		socf['cf_xsalesorder_seller_id']=distId;
 		socf['cf_xsalesorder_buyer_id']=buyerId;
 		var {xGenSeries,xtransactionseriesid} = await self.getDefaultXSeries(distId,'Sales Order',log);
 		socf['cf_salesorder_transaction_number']=xGenSeries;
 		socf['cf_salesorder_transaction_series']=xtransactionseriesid;
 		socf['created_at']=moment().format('YYYY-MM-DD HH:mm:ss');
 		socf['modified_at']=moment().format('YYYY-MM-DD HH:mm:ss');
 		socf['deleted']=0;
 		return{so:so,socf:socf,soBillAds:soBillAds,soShipAds:soShipAds};
 	}
 	rSalesOrder.prototype.getDefaultXSeries=async function(distId,type,increment=true,log){
 		try{
 			var self=this;
 			var dbconn=this.getDb();
 			const XSeries=dbconn.import('./../../models/x-series');
 			const XSeriesCf=dbconn.import('./../../models/x-series-cf');
 			return XSeriesCf.findOne({
 				where:{
 					cf_xtransactionseries_transaction_type:type
 				},
 				
 				include:[{
 					model:XSeries,
 					required:true,
 					where:{xdistributorid:distId,deleted:0},
 					
 				}],
 				logging:(msg)=>{
 					log.debug(msg);
 				}
 			}).then(async function(series){
 				
 				if(series){
 					try{
 						
 						const diffFromLastXDate= await self.getDiffernceBtLastXDate(series);
 						var nextValue=currentValue=minValue=0;
 						if(series.cf_xtransactionseries_cycle_frequency=='Daily'||series.cf_xtransactionseries_cycle_frequency=='Monthly' || series.XSery.fiscal_finance.length<=0){
 							if(diffFromLastXDate>0){
 								nextValue=currentValue=series.cf_xtransactionseries_minimum_value;
 								minValue=1;
 							}
 							else{
 								currentValue =series.cf_xtransactionseries_current_value;
 								nextValue=currentValue= currentValue+1;
 							}
 						}
 						else{
 							if(diffFromLastXDate>0){
 								const fiscalFinanceMonth=moment().month('"'+series.XSery.fiscal_finance+'"').format('MM');
 								const currentMonth=moment().format('MM');
 								
 								if(fiscalFinanceMonth.isSameOrAfter(currentMonth) || diffFromLastXDate>1 ||series.XSery.fiscal_finance.length<=0){
 									nextValue=currentValue=series.cf_xtransactionseries_minimum_value;
 									minValue = 1;
 								}
 								else{
 									currentValue =series.cf_xtransactionseries_current_value;
 									nextValue=currentValue= currentValue+1;
 								}
 							}
 							else{
 								const fiscalFinanceYearMonth=moment().month('"'+series.XSery.fiscal_finance+'"').format('YYYY-MM');
 								const currentYearMonth=moment().format('YYYY-MM');
 								const LastDateUpdate=moment(series.cf_xtransactionseries_last_fetch_date).format('YYYY-MM');
 								const fisMonthCurYear=moment([moment().format('YYYY'),moment().month('"'+series.XSery.fiscal_finance+'"').format('MM')]).format('YYYY-MM');
 								if(currentYearMonth>=fisMonthCurYear && LastDateUpdate<fisMonthCurYear){
 									nextValue=currentValue=series['cf_xtransactionseries_current_value'];
 									minValue=1;
 								}
 								else{
 									nextValue=currentValue=series['cf_xtransactionseries_current_value']+1;
 								}
 							}
 						}
 						if(increment==true){
 							if(minValue==1){
 								
 								series.cf_xtransactionseries_current_value=series.cf_xtransactionseries_minimum_value;
 								series.cf_xtransactionseries_last_fetch_date=moment().format('YYYY-MM-DD HH:mm:ss');
 								series.save().then(()=>{
 									nextValue=currentValue=series.cf_xtransactionseries_current_value;

 								});

 							}
 							else{
 								series.cf_xtransactionseries_current_value=Number(series.cf_xtransactionseries_current_value)+1;
 								series.cf_xtransactionseries_last_fetch_date=moment().format('YYYY-MM-DD HH:mm:ss');
 								series.save().then(()=>{
 									nextValue=currentValue=series.cf_xtransactionseries_current_value;
 								});
 							}
 							
 						}
 						var xGenSeries='';
 						for( let key in series.rawAttributes ){
 							if(key.includes('scheme') && series[key].length>0 ){
 								if(Number(key.substr(-2))){
 									var gen=await self.getNextValueForSeries(series[key],nextValue);
 									xGenSeries=xGenSeries+gen;
 								}
 								else{
 									xGenSeries=xGenSeries+series[key];
 								}

 							}

 						}
 						
 						
 						return {xGenSeries:xGenSeries,xtransactionseriesid:series.xtransactionseriesid};
 						
 					}
 					catch(e){
 						//console.log(e);
 						return false;
 					}
 				}
 				else{
 					return false;
 				}
 				
 			}).catch(e=>{
 				return false;
 			});
 		}catch(e){
 			return false;
 		}
 	}

 	rSalesOrder.prototype.getDiffernceBtLastXDate= async function(trans){
 		
 		try{
 			if(trans.cf_xtransactionseries_last_fetch_date.length<=0){
 				return 1;
 			}
 			else{
 				const currentDate=moment();
 				const lastXDate=moment(trans.cf_xtransactionseries_last_fetch_date,'YYYY-MM-DD');
 				switch(trans.cf_xtransactionseries_cycle_frequency){
 					case 'Daily' :
 					return currentDate.diff(lastXDate,'days');
 					break;
 					case 'Monthly' :
 					return currentDate.diff(lastXDate,'months');
 					break;
 					default:
 					return currentDate.diff(lastXDate,'years');
 					break;
 				}
 			}
 			
 		}catch(e){
 			return 1;
 		}
 	}

 	rSalesOrder.prototype.getNextValueForSeries=async function(value,nextValue){

 		var str="";
 		switch (value) {
 			case "DD":
 			str = moment().format('DD').toString();
 			break;
 			case "MM":
 			str = moment().format('MM').toString();
 			break;
 			case "MMM":
 			str = moment().format('MMM').toString();
 			break;
 			case "YY":
 			str = moment().format('YY').toString();
 			break;
 			case "YYYY":
 			str = moment().format('YYYY').toString();
 			break;
 			case "HH":
 			str = moment().format('HH').toString();
 			break;
 			case "mm":
 			str = moment().format('mm').toString();
 			break;
 			case "SS":
 			str = moment().format('SS').toString();
 			break;
 			default: 

 			str = nextValue.padEnd(value.length,'0');
 			break;
 		}
 		//console.log(value,str);
 		return str;
 		
 	}
 	rSalesOrder.prototype.getCreditTerm=async function(buyerId,log){
 		try{
 			var self=this;
 			var dbconn=this.getDb();
 			const Retailer=dbconn.import('./../../models/retailer');
 			const RetailerCf=dbconn.import('./../../models/retailer-cf');
 			return RetailerCf.findOne({
 				where:{
 					xretailerid:buyerId,
 					cf_xretailer_status:'Approved',
 					cf_xretailer_active:'1',},
 					attributes:['cf_xretailer_creditdays','cf_xpayment_payment_mode'],
 				//,
 				include:[
 				{
 					model:Retailer,
 					required:true,
 					attributes:['xretailerid','customercode','customername']

 				}
 				],
 				logging:(msg)=>{
 					log.debug(msg)
 				}
 			}).then(retailer=>{
 				return retailer.cf_xretailer_creditdays;
 			}).catch(e=>{
 				
 			});
 		}catch(e){

 		}
 	}
 	rSalesOrder.prototype.prepareBillAds=async function(soId,refId,log){
 		var self=this;
 		var dbconn=this.getDb();
 		const SoBillAds=dbconn.import('./../../models/so-bill-ads');
 		soBillAds=new SoBillAds();
 		var billAddress=await self.getAddress('Billing',refId,log);
 		
 		soBillAds['sobilladdressid']=soId;
 		soBillAds['bill_street']=billAddress.AddressCf.cf_xaddress_address;
 		soBillAds['bill_pobox']=billAddress.AddressCf.cf_xaddress_po_box;
 		soBillAds['bill_city']=billAddress.AddressCf.cf_xaddress_city;
 		soBillAds['bill_state']=await self.getState(billAddress.xstateid,log);
 		soBillAds['bill_code']=billAddress.AddressCf.cf_xaddress_postal_code;
 		soBillAds['bill_country']=billAddress.AddressCf.cf_xaddress_country;
 		soBillAds['xaddressid']=billAddress.xaddressid;
 		return soBillAds;
 	}

 	rSalesOrder.prototype.prepareShipAds=async function(soId,refId,log){
 		var self=this;
 		var dbconn=this.getDb();
 		const SoShipAds=dbconn.import('./../../models/so-ship-ads');
 		soShipAds=new SoShipAds();
 		var shipAddress=await self.getAddress('Shipping',refId,log);
 		soShipAds['soshipaddressid']=soId;
 		soShipAds['ship_street']=shipAddress.AddressCf.cf_xaddress_address;
 		soShipAds['ship_pobox']=shipAddress.AddressCf.cf_xaddress_po_box;
 		soShipAds['ship_city']=shipAddress.AddressCf.cf_xaddress_city;
 		soShipAds['ship_state']=await self.getState(shipAddress.xstateid,log);
 		soShipAds['ship_code']=shipAddress.AddressCf.cf_xaddress_postal_code;
 		soShipAds['ship_country']=shipAddress.AddressCf.cf_xaddress_country;
 		soShipAds['gstinno']=shipAddress.gstinno;
 		soShipAds['xaddressid']=shipAddress.xaddressid;

 		return soShipAds;
 	}

 	rSalesOrder.prototype.getCustomerRefId=async function(buyerId,log){
 		var self=this;
 		const dbconn=this.getDb();
 		const RecCustMaster=dbconn.import('./../../models/rec-cust-mas');
 		return RecCustMaster.findOne({
 			where:{xreceivecustomermasterid:buyerId},
 			attributes:['reference_id'],
 			logging:(msg)=>{
 				log.debug(msg);
 			}
 		}).then(cust=>{
 			if(cust){
 				return cust.reference_id;
 			}
 			else{
 				return buyerId;
 			}
 		}).catch(e=>{
 			return buyerId;
 		})
 	}
 	rSalesOrder.prototype.getStageAction=async function(action,log){
 		try{
 			const dbconn=this.getDb();
 			var self=this;
 			const WFStageCf=dbconn.import('./../../models/workflow-stage-cf');
 			const WorkFlowCf=dbconn.import('./../../models/workflow-cf');
 			return WorkFlowCf.findOne({
 				where:{
 					cf_workflow_module:'xrsalesorder',
 					
 				},
 				include:[{model:WFStageCf,required:true,where:{cf_workflowstage_user_role:'Distributor',
 				cf_workflowstage_possible_action:action}}],
 				logging:(msg)=>{
 					log.debug(msg);
 				}
 				
 			}).then(res=>{
 				if(res.dataValues.WFStageCfs[0].dataValues){
 					return res.dataValues.WFStageCfs[0].dataValues;
 				}
 			}).catch(e=>{
 				return false;
 			});
 		}catch(e){
 			return false
 		}

 	}
 	rSalesOrder.prototype.isSoConverted=async function(soid,log){
 		try{
 			const dbconn=this.getDb();
 			var self=this;
 			const CrmEntityRel=dbconn.import('./../../models/crmentity-rel');
 			return CrmEntityRel.findOne({
 				where:{
 					relmodule:'xSalesOrder',module:'xrSalesOrder',crmid:soid
 				},
 				logging:(msg)=>{
 					log.debug(msg)
 				}
 			}).then(res=>{
 				if(res){
 					return true;
 				}
 			}).catch(e=>{
 				return false;
 			});
 		}
 		catch(e){
 			return false;
 		}
 	}
 	rSalesOrder.prototype.getCrmEntityRel=async function(refId,log){
 		try{
 			var self=this;
 			var dbconn=this.getDb();
 			const CrmEntityRel=dbconn.import('./../../models/crmentity-rel');
 			return CrmEntityRel.findAll({
 				where:{crmid:refId,relmodule:'xAddress'},
 				attributes:['relcrmid'],
 				logging:(msg)=>{
 					log.debug(msg)
 				}
 			}).then(entity=>{
 				if(entity){
 					var relCrmIds=entity.map(entity=>entity.relcrmid)
 					return relCrmIds;
 				}
 			}).catch(e=>{
 				return false;
 			})
 		}catch(e){
 			return false;
 		}
 	}
 	rSalesOrder.prototype.getState=async function(stateId,log){
 		try{
 			var self=this;
 			var dbconn=this.getDb();
 			const State=dbconn.import('./../../models/state');
 			return State.findOne({
 				where:{xstateid:stateId},
 				attributes:['statename'],
 				logging:(msg)=>{
 					log.debug(msg);
 				}
 			}).then(state=>{
 				if(state){
 					return state.statename;
 				}
 			}).catch(e=>{
 				return false;
 			})
 		}catch(e){
 			return false;
 		}
 	}
 	rSalesOrder.prototype.getAddress=async function(type,refId,log){
 		try{

 			var self=this;
 			var dbconn=this.getDb();
 			const AddressCf=dbconn.import('./../../models/address-cf');
 			const Address=dbconn.import('./../../models/address');
 			
 			const State=dbconn.import('./../../models/state');
 			var relCrmId=await self.getCrmEntityRel(refId,log);
 			return Address.findOne({
 				attributes:['addresscode','gstinno','xstateid','xaddressid'],
 				include:[
 				{
 					model:AddressCf,
 					required:true,
 					where:{
 						cf_xaddress_address_type:type,
 						cf_xaddress_mark_as_default:1,
 						cf_xaddress_active:1,
 						xaddressid:{[Op.in]:relCrmId},
 					}
 				}
 				],
 				logging:(msg)=>{
 					log.debug(msg)
 				}
 			}).then(res=>{
 				if(res){
 					return res;
 				}
 			}).catch(e=>{
 				return false;
 			});		
 		}catch(e){
 			return false;
 		}
 	}
 	rSalesOrder.prototype.getCrmEntity=async function(module,log){
 		const dbconn=this.getDb();
 		const CrmEntity=dbconn.import('./../../models/crmentity');
 		const CrmEntitySeq=dbconn.import('./../../models/crmentityseq');
 		const VtigerTab=dbconn.import('./../../models/vtiger-tab');
 		var id=await CrmEntitySeq.fnxtIncrement(log);
 		var tab=await VtigerTab.getTab(module,log);
 		var rsocrm=new CrmEntity({
 			crmid:id,
 			smcreatorid:0,
 			smownerid:0,
 			modifiedby:0,
 			setype:tab.name,
 			setype_id:tab.tabid,
 			description:null,
 			createdtime:new Date(),
 			modifiedtime:new Date(),
 			viewedtime:null,
 			status:null,
 			version:0,
 			presence:1,
 			deleted:0,
 			sendstatus:null,
 			terms_conditions:null,
 		});
 		return rsocrm.save({logging:(msg)=>{
 			log.debug(msg);
 		}}).then(crm=>{
 			return crm.crmid;
 		}).catch(e=>{
 			throw new Error('Unable to create CRM entity for rSalesOrder.');
 		});

 	}
 	return rSalesOrder;
 })();
 module.exports=exports=rSalesOrder;
