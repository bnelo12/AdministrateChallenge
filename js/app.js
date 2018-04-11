var app = {
    create_org_menu_open: false,
    edit_org_menu_open: false,
    address_book: {
        organizations: []
    },
    update_ui: true
}

$(document).ready(function() {
    $('#add-org-button').click(function() {if (app.create_org_menu_open) {closeCreateOrgMenu();} else {openCreateOrgMenu();}});
    $('#submit-add-org-button').click(submitCreateOrgMenu);
    getOrgsFromDatabase();
    setInterval(updateUI, 200);
});

var openCreateOrgMenu = function() {
    closeAllMenus();
    app.create_org_menu_open = true;
    $('#add-org-button-icon').text('clear');
    $('.add-organization-view').velocity({
        left: "25%"
    }, {
        easing: "swing",
    });
    $('#add-org-button').velocity({
        left: $('#add-org-button').position().left + $('.add-organization-view').width()
    }, {
        easing: "swing"
    });
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

var submitCreateOrgMenu = function() {
    // closeCreateOrgMenu();
    $("#submit-add-org-button").hide();
    $("#add-org-spinner").addClass('is-active');
    let orgJSON = createOrgJSON();
    $.ajax( { url: "https://api.mlab.com/api/1/databases/address_book/collections/organization?apiKey=gnDOBHPppSOdnVmBok9SOEfBtCTEmLyj",
		  data: orgJSON,
		  type: "POST",
          contentType: "application/json",
          success: function(data, status) {
            closeCreateOrgMenu();
            clearCreateOrgMenu();
            addOrganizationToList(orgJSON.name, orgJSON.email);
            $("#submit-add-org-button").show();
            $("#add-org-spinner").removeClass('is-active');
          }
    });
}

var closeCreateOrgMenu = function() {
    $('#add-org-button-icon').text('add');
    $('.add-organization-view').velocity({
        left: "0"
    }, {
        easing: "swing",
    });
    $('#add-org-button').velocity({
        left: $('.add-organization-view').width() - 20
    }, {
        easing: "swing",
    });
    app.create_org_menu_open = false;
}

var createOrgJSON = function() {
    let orgJSON = JSON.stringify($('#add-org-form input').serializeArray().reduce((obj, field) => {
        obj[field.name] = field.value;
        return obj;
    }, {}));
    orgJSON['_id'] = orgJSON.name;
    return orgJSON
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
}

var openEditOrgMenu = function(orgName) {
    closeAllMenus();
    $('#organization-name').text(orgName);
    $('.organization-detail').velocity({
        left: "25%"
    }, {
        easing: "swing",
    });
    app.edit_org_menu_open = true;
}

var closeEditOrgMenu = function() {
    $('#add-org-button-icon').text('add');
    $('.organization-detail').velocity({
        left: "0"
    }, {
        easing: "swing",
    });
    app.edit_org_menu_open = false;
}

var addOrganizationToList = function(orgName, orgEmail) {
    let template = document.querySelector('#organization-list-item');
    let clone = document.importNode(template.content, true);
    $(clone).find('#organization-name').text(orgName);
    $(clone).find('#organization-email').text(orgEmail);
    let orgElem = $('#organization-list').append(clone);
    //$(orgElem[0]).attr("id", "org-".concat(orgName));
    orgElem.css("transform", "translate(-100%)");
    $('#org-' + orgName).click(() => {
        openEditOrgMenu(orgName);
    });
    $(orgElem).velocity({transform: "translate(-100%)"}, {
        duration: 0,
        complete: function() {
            $(orgElem).velocity({transform: "translate(0px)"}, {easing: "swing"});
        }
    });
}