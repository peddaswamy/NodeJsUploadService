module.exports=(sequelize,DataTypes)=>{
    const RecCustMaster=sequelize.define('RecCustMaster',{
        xreceivecustomermasterid:{
            type:DataTypes.INTEGER(11),
              primaryKey: true,
        },
        customername:{
            type:DataTypes.STRING(100),
            defaultValue:null,
        },
        customercode:{
            type:DataTypes.STRING(100),
            defaultValue:null,
        },
        alternative_name:{
            type:DataTypes.STRING(100),
            defaultValue:null,
        },
        xretailer_address_2:{
            type:DataTypes.STRING(100),
            defaultValue:null,
        },
        xretailer_pin_code:{
            type:DataTypes.STRING(50),
            defaultValue:null,
        },
        xretailer_city:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        xretailer_state:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        xretailer_contact_person:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        xretailer_phone:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        xretailer_mobile_no:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        xretailer_email:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        xretailer_active:{
            type:DataTypes.INTEGER(1),
            defaultValue:null,
        },
        location_area:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        district:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        xretailer_tin_number:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        fssai:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        xretailer_channel_type:{
            type:DataTypes.BIGINT(20),
            defaultValue:null,
        },
        xretailer_supply_chain_distributor:{
            type:DataTypes.BIGINT(20),
            defaultValue:null,
        },
        xretailer_value_classification:{
            type:DataTypes.BIGINT(20),
            defaultValue:null,
        },
        xretailer_geography:{
            type:DataTypes.BIGINT(20),
            defaultValue:null,
        },
        xretailer_general_classification:{
            type:DataTypes.BIGINT(20),
            defaultValue:null,
        },
        xretailer_customer_group:{
            type:DataTypes.BIGINT(20),
            defaultValue:null,
        },
        xretailer_potential:{
            type:DataTypes.BIGINT(20),
            defaultValue:null,
        },
        xretailer_distance:{
            type:DataTypes.DECIMAL(11,6),
            defaultValue:null,
        },
        registration_date:{
            type:DataTypes.STRING(20),
            defaultValue:null,
        },
        dob:{
            type:DataTypes.DATE,
            defaultValue:null,
        },
        doa:{
            type:DataTypes.DATE,
            defaultValue:null,
        },
        latitude:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        longitude:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        internal_ref_no:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        xretailer_non_confi_frieght_rate:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        xretailer_confi_frieght_rate:{
            type:DataTypes.DECIMAL(11,6),
            defaultValue:null,
        },
        xpayment_payment_mode:{
            type:DataTypes.BIGINT(20),
            defaultValue:null,
        },
        cash_discount:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        xretailer_creditdays:{
            type:DataTypes.BIGINT(20),
            defaultValue:null,
        },
        xretailer_creditbills:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        xretailer_outstanding_validation:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        xretailer_creditamount:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        bank_name:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        branch_name:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        bank_account_number:{
            type:DataTypes.STRING(30),
            defaultValue:null,
        },
        ifsc_code:{
            type:DataTypes.STRING(20),
            defaultValue:null,
        },
        xretailer_status:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        xretailer_next_stage_name:{
            type:DataTypes.STRING(100),
            defaultValue:null,
        },
        distributor_id:{
            type:DataTypes.BIGINT(20),
            defaultValue:null,
        },
        xretailer_sales_man:{
            type:DataTypes.STRING(100),
            defaultValue:null,
        },
        xretailer_beat:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        xretailer_retailer_group:{
            type:DataTypes.BIGINT(20),
            defaultValue:null,
        },
        xretailer_credit_limit:{
            type:DataTypes.DECIMAL(25,2),
            defaultValue:null,
        },
        reference_id:{
            type:DataTypes.BIGINT(20),
            defaultValue:0,
        },
        flag:{
            type:DataTypes.INTEGER(4),
            defaultValue:0,
        },
        alternative_mob_num:{
            type:DataTypes.STRING(30),
            defaultValue:null,
        },
        std_code:{
            type:DataTypes.STRING(20),
            defaultValue:null,
        },
        ret_store_name:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        gender:{
            type:DataTypes.STRING(30),
            defaultValue:null,
        },
        cust_first_name:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        cust_middle_name:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        cust_last_name:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        landmark:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        plot_number:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        street_name:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        taluka_name:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        area_name:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        market_name:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        idcardtype:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        id_card_number:{
            type:DataTypes.STRING(200),
            defaultValue:null,
        },
        typeshopfirm:{
            type:DataTypes.STRING(200),
            defaultValue:null,
        },
        idproofimagename:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        unique_retailer_code:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        lube_territory_code:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        lube_territory_name:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        retailerimagename:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        population:{
            type:DataTypes.STRING(255),
            
        },
        helpers_count:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        addressproof:{
            type:DataTypes.STRING(255),
            defaultValue:null,
        },
        region:{
            type:DataTypes.STRING(255),
            defaultValue:null,
            
        },
        mobile_application:{
            type:DataTypes.INTEGER(1),
            defaultValue:null,
        },
        created_at:{
            type:DataTypes.DATE,
            defaultValue:null,
        },
        modified_at:{
            type:DataTypes.DATE,
            defaultValue:null,
        },
        is_processed:{
            type:DataTypes.INTEGER(1),
            defaultValue:0,
        },
        deleted:{
            type:DataTypes.INTEGER(1),
            defaultValue:0,
        },
        gstinno:{
            type:DataTypes.STRING(100),
            defaultValue:null,
        },
        panno:{
            type:DataTypes.STRING(250),
            defaultValue:null,
        },
        typeofservices:{
            type:DataTypes.STRING(250),
            defaultValue:null,
        },
        generated_otp:{
            type:DataTypes.STRING(250),
            defaultValue:null,
        },
        is_otp_verified:{
            type:DataTypes.INTEGER(1),
            defaultValue:null,
        },
        retailer_program_flag3:{
            type:DataTypes.STRING(250),
           
        },
        retailer_program_flag2:{
            type:DataTypes.STRING(250),
            
        },
        retailer_program_flag1:{
            type:DataTypes.STRING(250),
           
        },
        store_layout:{
            type:DataTypes.STRING(250),
            defaultValue:null,
        },
        store_type:{
            type:DataTypes.STRING(250),
            defaultValue:null,
        },
        store_size:{
            type:DataTypes.STRING(250),
            defaultValue:null,
        },
        shelves_count:{
            type:DataTypes.STRING(250),
            defaultValue:null,
        },
        retailer_drug_no_20b:{
            type:DataTypes.STRING(250),
            defaultValue:null,
        },
        retailer_drug_no_21b:{
            type:DataTypes.STRING(250),
            defaultValue:null,
        },
        xsupplychainhierid:{
            type:DataTypes.BIGINT(20),
            defaultValue:null,
        },
        counter_sales_customer:{
            type:DataTypes.INTEGER(3),
            defaultValue:null,
        },
        branded_shop_board_presence:{
            type:DataTypes.ENUM('yes','no'),
            defaultValue:null,
        },
        premium_edible_oil:{
            type:DataTypes.ENUM('yes','no'),
            defaultValue:null,
        },
        branded_rice_presence:{
            type:DataTypes.ENUM('yes','no'),
            defaultValue:null,
        },
        cf_xretailer_creditbills:{
            type:DataTypes.STRING(250),
            defaultValue:null,
        },
        cf_xretailer_creditamount:{
            type:DataTypes.STRING(250),
            defaultValue:null,
        },
        product_category_group:{
            type:DataTypes.INTEGER(10),
            defaultValue:null,
        },
        cf_xretailer_creditdays:{
            type:DataTypes.BIGINT(20),
            defaultValue:null,
        },
        sales_field_officer_code:{
            type:DataTypes.TEXT,
            defaultValue:null,
        },
        cf_xretailer_next_stage_name:{
            type:DataTypes.STRING(250),
            defaultValue:null,
        },
        cf_xretailer_parent_channel_type:{
            type:DataTypes.STRING(250),
            defaultValue:null,
        },
        helpers_count:{
            type:DataTypes.STRING(250),
            defaultValue:null,
        },
        population:{
            type:DataTypes.STRING(250),
            defaultValue:null,
        },
        village_type:{
            type:DataTypes.STRING(250),
            defaultValue:null,
        },
        pop_strata:{
            type:DataTypes.STRING(250),
            defaultValue:null,
        },
        isdruglicenserequired:{
            type:DataTypes.STRING(250),
            defaultValue:null,
        },
        retailer_program_flag5:{
            type:DataTypes.STRING(250),
            defaultValue:null,
        },
        retailer_program_flag6:{
            type:DataTypes.STRING(250),
            defaultValue:null,
        },
        retailertaxtype:{
            type:DataTypes.STRING(250),
            defaultValue:null,
        },

    },{
        tableName:'vtiger_xreceivecustomermaster',
        timestamps:false,
        freezeTableName:true,
        indexes: [ { fields: [ 'distributor_id' ] },{fields:['customercode','xretailer_sales_man','xretailer_status']}],
    });
    return RecCustMaster;
};