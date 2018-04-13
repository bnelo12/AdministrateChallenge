var app = {
    create_org_menu_open: false,
    edit_org_menu_open: false,
    add_contact_menu_open: false,
    edit_contact_menu_open: false,
    edit_org_details_open: false,
    delete_org_menu_open: false,
    active_org: null,
    active_contact: null,
    address_book: {
        organizations: [],
        contacts: []
    },
    update_ui: true
}

$(document).ready(function() {
    $('#add-org-button').click(function() {if (app.create_org_menu_open) {closeCreateOrgMenu();} else {openCreateOrgMenu();}});
    $('#submit-add-org-button').click(submitCreateOrgMenu);
    $('#submit-add-contact-button').click(submitAddContactMenu);
    $('#delete-org-button').click(openDeleteOrgMenu);
    $('#add-contact-view').click(openAddContactMenu);
    $('#delete-org-button-confirm').click(deleteOrgFromDatabase);
    $('#delete-contact-button').click(deleteContactFromDatabase);
    $('#submit-edit-contact-button').click(submitEditContactMenu);
    $('#edit-org-details-button').click(openEditOrgDetailsMenu);
    $('#submit-edit-org-details-button').click(submitEditOrgDetails);
    $('.close-sub-menu-button').each(function(i, e) {
        $(e).click(closeAllSubMenus);
    });
    getOrgsFromDatabase();
    setInterval(updateUI, 200);
});

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
    if (app.add_contact_menu_open) return;
    closeAllSubMenus();
    app.add_contact_menu_open = true;
    $('.add-contact-view').velocity({
        transform: "translate(50vw)"
    }, {
        easing: "swing",
    });
}

var openDeleteOrgMenu = function() {
    if (app.delete_org_menu_open) return;
    closeAllSubMenus();
    app.delete_org_menu_open = true;
    $('.delete-org-view').velocity({
        transform: "translate(50vw)"
    }, {
        easing: "swing",
    });
}

var openEditContactMenu = function(name) {
    closeAllSubMenus();
    app.active_contact = getContactByName(name);
    app.edit_contact_menu_open = true;
    let phone = app.active_contact.phone;
    let email = app.active_contact.email;
    if (phone) {
        $("#edit-contact-form input")[0].value = phone;
        $("#edit-contact-form label")[0].innerText = "";
    }
    if (email) {
        $("#edit-contact-form input")[1].value = email;
        $("#edit-contact-form label")[1].innerText = "";
    }
    $('.edit-contact-view').velocity({
        transform: "translate(50vw)"
    }, {
        easing: "swing",
    });
}

var openEditOrgDetailsMenu = function(name) {
    closeAllSubMenus();
    app.edit_org_details_open = true;
    let phone = app.active_org.phone;
    let email = app.active_org.email;
    if (phone) {
        $("#edit-org-details-form input")[0].value = phone;
        $("#edit-org-details-form label")[0].innerText = "";
    }
    if (email) {
        $("#edit-org-details-form input")[1].value = email;
        $("#edit-org-details-form label")[1].innerText = "";
    }
    $('.edit-org-details-view').velocity({
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
        transform: "translate(25vw)"
    }, {
        easing: "swing",
    });
    getContactsFromDatabase(orgName);
    app.edit_org_menu_open = true;
}

var closeCreateOrgMenu = function() {
    $('#add-org-button-icon').text('add');
    clearCreateOrgMenu();
    $('.add-organization-view').velocity({
        transform: "translate(-25vw)"
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
        transform: "translate(-25vw)"
    }, {
        duration: 0
    });
}

var closeEditOrgMenu = function() {
    app.active_org = null;
    $('#contact-list').html("");
    $('#add-org-button-icon').text('add');
    $('.organization-detail').velocity({
        transform: "translate(-25%)"
    }, {
        duration: 0
    });
    app.edit_org_menu_open = false;
}

var closeDeleteOrgMenu = function() {
    app.delete_org_menu_open = false;
    $('.delete-org-view').velocity({
        transform: "translate(-25vw)"
    }, {
        duration: 0
    });
}

var closeEditContactMenu = function() {
    app.edit_contact_menu_open = false;
    clearEditContactMenu();
    $('.edit-contact-view').velocity({
        transform: "translate(-25vw)"
    }, {
        duration: 0
    });
}

var closeEditOrgDetailsMenu = function() {
    app.edit_org_details_open = false;
    clearEditContactMenu();
    $('.edit-org-details-view').velocity({
        transform: "translate(-25vw)"
    }, {
        duration: 0
    });
}

var getOrgsFromDatabase = function() {
    $.ajax( { url: "https://api.mlab.com/api/1/databases/address_book/collections/organization?apiKey=gnDOBHPppSOdnVmBok9SOEfBtCTEmLyj",
        type: "GET",
        contentType: "application/json",
        success: function(data, status) {
            app.address_book.organizations = data;
            app.update_ui = true;
        }
    });
}

var deleteContactFromDatabase = function() {
    let contact = app.active_contact.name;
    let query = "https://api.mlab.com/api/1/databases/address_book/collections/contacts?apiKey=gnDOBHPppSOdnVmBok9SOEfBtCTEmLyj";
    query += '&q={"name":"' + contact + '"}';
    $.ajax( { 
        url: query,
        data: "[]",
        type: "PUT",
        contentType: "application/json",
        success: function(data, status) {
            let id = ("contact-" + contact).replace(/\s+/g, '-');
            deleteContactByNameLocally();
            $('#' + id).parents('.deletable').remove();
            closeAllSubMenus();
            $('#org-error-toast')[0].MaterialSnackbar.showSnackbar({message: "Delete Successful"});
        }
    });
}

var deleteOrgFromDatabase = function() {
    let org = app.active_org.name;
    let query = "https://api.mlab.com/api/1/databases/address_book/collections/organization?apiKey=gnDOBHPppSOdnVmBok9SOEfBtCTEmLyj";
    query += '&q={"name":"' + org + '"}'
    $.ajax( { 
        url: query,
        data: "[]",
        type: "PUT",
        contentType: "application/json",
        success: function(data, status) {
            let id = ("org-" + org).replace(/\s+/g, '-');
            $('#' + id).remove();
            deleteOrgByNameLocally(org);
            closeAllMenus();
            $('#org-error-toast')[0].MaterialSnackbar.showSnackbar({message: "Delete Successful"});
        }
    });
    let query2 = "https://api.mlab.com/api/1/databases/address_book/collections/contacts?apiKey=gnDOBHPppSOdnVmBok9SOEfBtCTEmLyj";
    query2 += '&q={"organization":"' + org + '"}'
    $.ajax( { 
        url: query2,
        data: "[]",
        type: "PUT",
        contentType: "application/json",
    });
}

var getContactsFromDatabase = function(organizationName) {
    let query = "https://api.mlab.com/api/1/databases/address_book/collections/contacts?";
    query += "apiKey=gnDOBHPppSOdnVmBok9SOEfBtCTEmLyj&"
    query += 'q={"organization":"' + organizationName + '"}';
    $.ajax( { url: query,
        type: "GET",
        contentType: "application/json",
        success: function(data, status) {
            app.address_book.contacts = data;
            $('#contact-list').html("");
            data.forEach(function(contact) {
                addContactToList(contact.name, contact.email, contact.phone);
            });
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

var clearEditContactMenu = function() {
    $("#edit-contact-form label")[0].innerText = "Phone...";
    $("#edit-contact-form label")[1].innerText = "Email...";
    $("#edit-contact-form")[0].reset();
    $("#edit-contact-form .mdl-textfield")[0].MaterialTextfield.change()
    $("#edit-contact-form .mdl-textfield")[1].MaterialTextfield.change()
}

var createContactJSON = function() {
    let contactJSON = $('#add-contact-form input').serializeArray().reduce((obj, field) => {
        obj[field.name] = field.value;
        return obj;
    }, {});
    contactJSON['_id'] = contactJSON.name;
    contactJSON['organization'] = app.active_org.name;
    return contactJSON
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
    if (getOrgByName($('#add-org-form input')[0].value)) {
        $('#org-error-toast')[0].MaterialSnackbar.showSnackbar({message: "Organization name must be unique!"});
        return;
    }
    if ($('#add-org-form input')[0].value == "") {
        $('#org-error-toast')[0].MaterialSnackbar.showSnackbar({message: "Organization name is required!"});
        return;
    }
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
            app.address_book.organizations.push(orgJSON);
            $("#submit-add-org-button").show();
            $("#add-org-spinner").removeClass('is-active');
            $('#org-error-toast')[0].MaterialSnackbar.showSnackbar({message: "Organization added successfully!"});
          }
    });
}

var submitAddContactMenu = function() {
    if (getContactByName($('#add-contact-form input')[0].value)) {
        $('#org-error-toast')[0].MaterialSnackbar.showSnackbar({message: "Contact name must be unique!"});
        return;
    }
    if ($('#add-contact-form input')[0].value == "") {
        $('#org-error-toast')[0].MaterialSnackbar.showSnackbar({message: "Contact name is required!"});
        return;
    }
    $("#submit-add-contact-button").hide();
    $("#add-contact-spinner").addClass('is-active');
    let contactJSON = createContactJSON();
    $.ajax( { url: "https://api.mlab.com/api/1/databases/address_book/collections/contacts?apiKey=gnDOBHPppSOdnVmBok9SOEfBtCTEmLyj",
		  data: JSON.stringify(contactJSON),
		  type: "POST",
          contentType: "application/json",
          success: function(data, status) {
            closeAddContactMenu();
            $("#submit-add-contact-button").show();
            $("#add-contact-spinner").removeClass('is-active');
            app.address_book.contacts.push(contactJSON);
            addContactToList(contactJSON.name, contactJSON.email, contactJSON.phone);
            $('#org-error-toast')[0].MaterialSnackbar.showSnackbar({message: "Contact added successfully!"});
          }
    });
}

var submitEditContactMenu = function() {
    $("#submit-edit-contact-button").hide();
    $("#edit-contact-spinner").addClass('is-active');
    let newEmail = $("#edit-contact-form input")[1].value;
    let newPhone = $("#edit-contact-form input")[0].value;
    let contactJSON = {
        "phone": newPhone,
        "email": newEmail,
        "organization": app.active_org.name,
        "name": app.active_contact.name
    }
    $.ajax( { url: "https://api.mlab.com/api/1/databases/address_book/collections/contacts/" + app.active_contact.name + "?apiKey=gnDOBHPppSOdnVmBok9SOEfBtCTEmLyj",
		  data: JSON.stringify(contactJSON),
		  type: "PUT",
          contentType: "application/json",
          success: function(data, status) {
            $("#edit-contact-spinner").removeClass('is-active');
            $("#submit-edit-contact-button").show();
            let id = ("contact-" + app.active_contact.name).replace(/\s+/g, '-');
            $('#' + id).prev().find('#contact-email').text(newEmail);
            $('#' + id).prev().find('#contact-phone').text(newPhone);
            app.active_contact.email = newEmail;
            app.active_contact.phone = newPhone;
            closeEditContactMenu();
            $('#org-error-toast')[0].MaterialSnackbar.showSnackbar({message: "Contact edited successfully!"});
          }
    });
}

var submitEditOrgDetails = function() {
    $("#submit-edit-org-details-button").hide();
    $("#edit-org-details-spinner").addClass('is-active');
    let newEmail = $("#edit-org-details-form input")[1].value;
    let newPhone = $("#edit-org-details-form input")[0].value;
    let contactJSON = {
        "phone": newPhone,
        "email": newEmail,
        "name": app.active_org.name,
    }
    $.ajax( { url: "https://api.mlab.com/api/1/databases/address_book/collections/organization/" + app.active_org.name + "?apiKey=gnDOBHPppSOdnVmBok9SOEfBtCTEmLyj",
		  data: JSON.stringify(contactJSON),
		  type: "PUT",
          contentType: "application/json",
          success: function(data, status) {
            $("#edit-org-details-spinner").removeClass('is-active');
            $("#submit-edit-org-details-button").show();
            let id = ("org-" + app.active_org.name).replace(/\s+/g, '-');
            $('#org-detail-email').text('Email: ' + newEmail);
            $('#org-detail-phone').text('Phone: ' + newPhone);
            app.active_org.email = newEmail;
            app.active_org.phone = newPhone;
            closeEditOrgDetailsMenu();
            $('#org-error-toast')[0].MaterialSnackbar.showSnackbar({message: "Organization edited successfully!"});
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
    if (app.delete_org_menu_open) closeDeleteOrgMenu();
    if (app.edit_contact_menu_open) closeEditContactMenu();
    if (app.edit_org_details_open) closeEditOrgDetailsMenu();
}

var closeAllSubMenus = function() {
    if (app.add_contact_menu_open) closeAddContactMenu();
    if (app.delete_org_menu_open) closeDeleteOrgMenu();
    if (app.edit_contact_menu_open) closeEditContactMenu();
    if (app.edit_org_details_open) closeEditOrgDetailsMenu();
}

var getOrgByName = function(orgName) {
    return app.address_book.organizations.find(function(e) {
        return e.name == orgName;
    });
}

var deleteOrgByNameLocally = function(orgName) {
    let idx = app.address_book.organizations.indexOf(app.active_org);
    app.address_book.organizations.splice(idx, 1);
}

var deleteContactByNameLocally = function(orgName) {
    let idx = app.address_book.contacts.indexOf(app.active_contact);
    app.address_book.contacts.splice(idx, 1);
}

var getContactByName = function(name) {
    return app.address_book.contacts.find(function(e) {
        return e.name == name;
    });
}

var addOrganizationToList = function(orgName, orgEmail) {
    let template = document.querySelector('#organization-list-item');
    let clone = document.importNode(template.content, true);
    $(clone).find('#organization-name').text(orgName);
    $(clone).find('#organization-email').text(orgEmail);
    let id = ("org-" + orgName).replace(/\s+/g, '-');
    $(clone).find('.organization-list-item').attr('id', id);
    let orgElem = $('#organization-list').append(clone);
    $('#' + id).click(() => {
        openEditOrgMenu(orgName);
    });
    $('#' + id).velocity({transform: "translate(-100%)"}, {
        duration: 0,
        complete: function() {
            $('#' + id).velocity({transform: "translate(0)"}, {easing: "swing"});
        }
    });
}

var addContactToList = function(name, email, phone) {
    let template = document.querySelector('#contact-list-item');
    let clone = document.importNode(template.content, true);
    $(clone).find('#contact-name').text(name);
    $(clone).find('#contact-email').text(email);
    $(clone).find('#contact-phone').text(phone);
    let id = ("contact-" + name).replace(/\s+/g, '-');
    $(clone).find('button').attr('id', id);
    let orgElem = $('#contact-list').append(clone);
    $("#" + id).click(() => {
        openEditContactMenu(name);
    });
}