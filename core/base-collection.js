const Base =require('./base');
const { __extends }=require('tslib');
/**
 * 
 * @see 
 * @since Tue October 04, 2019 12:24 PM.
 * @author pedda.swamy@sifycorp.com 
 */
var BaseCollection=(function(){
    __extends(BaseCollection,Base);
    function BaseCollection(_data){
        Base.call(this);
        Object.defineProperty(this,'__data',{
            value:Object.assign({},_data),
            enumerable:false,
            writable:false,
            configurable:false,
        });
    }
    BaseCollection.prototype.documentType=function(){
        try{
            return this.__data.collections.vtiger_xrsodocinfo.documenttype._text
        } catch(err){
            throw new Error('Unable to get documenttype');
        }
    }
    BaseCollection.prototype.clientId=function(){
        try{
            return this.__data.collections.vtiger_xrsodocinfo.clientid._text
        } catch(err){
            throw new Error('Unable to get clientid');
        }
    }
    BaseCollection.prototype.transactionId=function(){
        try{
            return this.__data.collections.vtiger_xrsodocinfo.transactionid._text
        } catch(err){
            throw new Error('Unable to get transactionid');
        }
    }
    BaseCollection.prototype.destApplication=function(){
        try{
            return this.__data.collections.vtiger_xrsodocinfo.destapplication._text
        } catch(err){
            throw new Error('Unable to get destapplication');
        }
    }
    BaseCollection.prototype.sourceApplication=function(){
        try{
            return this.__data.collections.vtiger_xrsodocinfo.sourceapplication._text
        } catch(err){
            throw new Error('Unable to get sourceapplication');
        }
    }
    BaseCollection.prototype.fromId=function(){
        try{
            return this.__data.collections.vtiger_xrsodocinfo.fromid._text;
        }
        catch(e){
            throw new Error('Unable to get the from id from the collection');
        }
    }
    BaseCollection.prototype.docType=function(){
        try{
            return this.__data.collections.vtiger_xrsodocinfo.documenttype._text;
        }
        catch(e){
            throw new Error('Unable to get the from id from the collection');
        }
    }
    BaseCollection.prototype.prkey=function(){
        try{
            return this.__data.collections.prkey._text;
        }
        catch(e){
            throw new Error('Unable to get the from id from the collection');
        }
    }

    BaseCollection.prototype.createdDate=function(){
        try{
            return this.__data.collections.vtiger_xrsodocinfo.createddate._text;
        }
        catch(e){
            throw new Error('Unable to get the from id from the collection');
        }
    }
    return BaseCollection;
})();
module.exports=exports=BaseCollection;
