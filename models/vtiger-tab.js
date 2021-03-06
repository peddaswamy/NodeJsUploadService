module.exports=(sequelize,DataTypes)=>{
    const VtigerTab=sequelize.define('VtigerTab',{
        tabid:{
            type:DataTypes.INTEGER,
            primaryKey: true,
        },
        name:{
            type:DataTypes.STRING(255),
        },
        presence:{
            type:DataTypes.INTEGER,
            defaultValue:1,
        },
        tabsequence:{
            type:DataTypes.INTEGER,
            defaultValue:null,
        },
        tablabel:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        modifiedby:{
            type:DataTypes.INTEGER,
            defaultValue:null,
        },
        modifiedtime:{
            type:DataTypes.INTEGER,
            defaultValue:null,
        },
        customized:{
            type:DataTypes.INTEGER,
            defaultValue:null,
        },
        ownedby:{
            type:DataTypes.INTEGER,
            defaultValue:null,
        },
        isentitytype:{
             type:DataTypes.INTEGER,
            defaultValue:1,
        },
        version:{
             type:DataTypes.STRING(255),
            defaultValue:null,
        },
        archive:{
             type:DataTypes.INTEGER,
            defaultValue:0,
        },
    },
    {
        tableName:'vtiger_tab',
        timestamps:false,
        freezeTableName:true,
        indexes: [ { unique: true, fields: [ 'name' ] } ],
    });
    VtigerTab.getTab=async function(module,log){
        return VtigerTab.findOne({where:{name:module},logging:(msg)=>{
            log.debug(msg);
        }});
    }
    return VtigerTab;
};