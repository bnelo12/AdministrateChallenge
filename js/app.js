var app = {
    create_org_menu_open: false,
    edit_org_menu_open: false,
    add_contact_menu_open: false,
    active_org: null,
    address_book: {
        organizations: []
    },
    update_ui: true
}

$(document).ready(function() {
    $('#add-org-button').click(function() {if (app.create_org_menu_open) {closeCreateOrgMenu();} else {openCreateOrgMenu();}});
    $('#submit-add-org-button').click(submitCreateOrgMenu);
    $('#submit-add-contact-button').click(submitAddContactMenu);
    $('#add-contact-view').click(openAddContactMenu);
    getOrgsFromDatabase();
    setInterval(updateUI, 200);
});

// var Menu = (function {
//     var Menus = ()
// })

var openCreateOrgMenu = function() {
    closeAllMenus();
    app.create_org_menu_open = true;
    $('#add-org-button-icon').text('clear');
    $('.add-organization-view').velocity({
        transform: "translate(25vw)"
    }, {
        easing: "swing",
    });
    $('#add-org-button').velocity({
        transform: "translate(25vw)"
    }, {
        easing: "swing"
    });
}

var openAddContactMenu = function() {
    app.add_contact_menu_open = true;
    $('.add-contact-view').velocity({
        transform: "translate(50vw)"
    }, {
        easing: "swing",
    });
}

var openEditOrgMenu = function(orgName) {
    closeAllMenus();
    app.active_org = getOrgByName(orgName);
    $('#organization-name').text(app.active_org.name);
    $('#org-detail-phone').text("Phone: " + app.active_org.phone);
    $('#org-detail-email').text("Email: " + app.active_org.email);
    $('.organization-detail').velocity({
        left: "25%"
    }, {
        easing: "swing",
    });
    app.edit_org_menu_open = true;
}

var closeCreateOrgMenu = function() {
    $('#add-org-button-icon').text('add');
    clearCreateOrgMenu();
    $('.add-organization-view').velocity({
        transform: "translate(0)"
    }, {
        duration: 0
    });
    $('#add-org-button').velocity({
        transform: "translate(0)"
    }, {
        duration: 0
    });
    app.create_org_menu_open = false;
}

var closeAddContactMenu = function() {
    app.add_contact_menu_open = false;
    clearAddContactMenu();
    $('.add-contact-view').velocity({
        transform: "translate(0)"
    }, {
        duration: 0
    });
}

var closeEditOrgMenu = function() {
    app.active_org = null;
    $('#add-org-button-icon').text('add');
    $('.organization-detail').velocity({
        left: "0"
    }, {
        duration: 0
    });
    app.edit_org_menu_open = false;
}

var getOrgsFromDatabase = function() {
    $.ajax( { url: "https://api.mlab.com/api/1/databases/address_book/collections/organization?apiKey=gnDOBHPppSOdnVmBok9SOEfBtCTEmLyj",
        data: createOrgJSON(),
        type: "GET",
        contentType: "application/json",
        success: function(data, status) {
            app.address_book.organizations = data;
            app.update_ui = true;
        }
    });
}

var clearCreateOrgMenu = function() {
    $("#add-org-form")[0].reset();
    $("#add-org-form .mdl-textfield")[0].MaterialTextfield.change()
    $("#add-org-form .mdl-textfield")[1].MaterialTextfield.change()
    $("#add-org-form .mdl-textfield")[2].MaterialTextfield.change()
}

var clearAddContactMenu = function() {
    $("#add-contact-form")[0].reset();
    $("#add-contact-form .mdl-textfield")[0].MaterialTextfield.change()
    $("#add-contact-form .mdl-textfield")[1].MaterialTextfield.change()
    $("#add-contact-form .mdl-textfield")[2].MaterialTextfield.change()
}

var createContactJSON = function() {
    let orgJSON = $('#add-contact-form input').serializeArray().reduce((obj, field) => {
        obj[field.name] = field.value;
        return obj;
    }, {});
    orgJSON['_id'] = orgJSON.name;
    return orgJSON
}

var createOrgJSON = function() {
    let orgJSON = $('#add-org-form input').serializeArray().reduce((obj, field) => {
        obj[field.name] = field.value;
        return obj;
    }, {});
    orgJSON['_id'] = orgJSON.name;
    return orgJSON
}

var submitCreateOrgMenu = function() {
    $("#submit-add-org-button").hide();
    $("#add-org-spinner").addClass('is-active');
    let orgJSON = createOrgJSON();

    $.ajax( { url: "https://api.mlab.com/api/1/databases/address_book/collections/organization?apiKey=gnDOBHPppSOdnVmBok9SOEfBtCTEmLyj",
		  data: JSON.stringify(orgJSON),
		  type: "POST",
          contentType: "application/json",
          success: function(data, status) {
            closeCreateOrgMenu();
            addOrganizationToList(orgJSON.name, orgJSON.email);
            $("#submit-add-org-button").show();
            $("#add-org-spinner").removeClass('is-active');
          }
    });
}

var submitAddContactMenu = function() {
    $("#submit-add-contact-button").hide();
    $("#add-contact-spinner").addClass('is-active');
    let contactJSON = createContactJSON();

    $.ajax( { url: "https://api.mlab.com/api/1/databases/address_book/collections/contacts?apiKey=gnDOBHPppSOdnVmBok9SOEfBtCTEmLyj",
		  data: JSON.stringify(contactJSON),
		  type: "POST",
          contentType: "application/json",
          success: function(data, status) {
            closeAddContactMenu();
            $("#submit-add-org-button").show();
            $("#add-org-spinner").removeClass('is-active');
          }
    });
}

var updateUI = function() {
    if (app.update_ui) {
        app.update_ui = false;
        app.address_book.organizations.forEach(function(org) {
            addOrganizationToList(org.name, org.email);
        });
    }
}

var closeAllMenus = function() {
    if (app.create_org_menu_open) closeCreateOrgMenu();
    if (app.edit_org_menu_open) closeEditOrgMenu();
    if (app.add_contact_menu_open) closeAddContactMenu();
}

var getOrgByName = function(orgName) {
    return app.address_book.organizations.find(function(e) {
        return e.name == orgName;
    });
}

var addOrganizationToList = function(orgName, orgEmail) {
    let template = document.querySelector('#organization-list-item');
    let clone = document.importNode(template.content, true);
    $(clone).find('#organization-name').text(orgName);
    $(clone).find('#organization-email').text(orgEmail);
    $(clone).find('li').attr('id', "org-" + orgName);
    let orgElem = $('#organization-list').append(clone);
    $('#org-' + orgName).click(() => {
        openEditOrgMenu(orgName);
    });
    $('#org-' + orgName).velocity({transform: "translate(-100%)"}, {
        duration: 0,
        complete: function() {
            $('#org-' + orgName).velocity({transform: "translate(0)"}, {easing: "swing"});
        }
    });
}