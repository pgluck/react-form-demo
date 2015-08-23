/** ============================================================================
 * File:    app.js
 * Purpose: Demo app using React, Bootstrap, and jQuery
 * Author:  Peter R. Gluck
 * Created: 2015-08-20
 * (c) 2015 Peter R. Gluck.  All rights reserved.
 * ============================================================================*/
'use strict';

// Load dependencies and establish references
window.$ = window.jQuery = require('jquery');
require('bootstrap');
require('jquery-validation');

var fs = require('fs');

// Load data
var dataFilePath = './data.json';
var buffer = fs.readFileSync(dataFilePath); 
var data = JSON.parse(buffer);

// Keep track of any changes to the data
var isDataDirty = false;

// Compile all form values into a JSON object
function formToObject(form) {
	var inputs = $(form).serializeArray();
  var obj = {};
  $.each(inputs, function(index, item) {
    obj[item.name] = item.value;
	});

  return obj;
}

/** ============================================================================
 *  Bootstrap-styled button component
 * ============================================================================*/
var BootstrapButton = React.createClass({
  render: function() {
    return (
      <a {...this.props}
        href="javascript:;"
        role="button"
        className={(this.props.className || '') + ' btn'} />
    );
  }
});

/** ============================================================================
 *  Bootstrap-styled modal dialog window
 *  (nicer than than built-in alert/confirm or jQuery alone)
 * ============================================================================*/
var BootstrapModal = React.createClass({

  // The following two methods are the only places we need to
  // integrate Bootstrap or jQuery with the components lifecycle methods.
  componentDidMount: function() {

    // When the component is added, turn it into a modal
    $(React.findDOMNode(this))
      .modal({backdrop: 'static', keyboard: false, show: false});
  },

  componentWillUnmount: function() {
    $(React.findDOMNode(this)).off('hidden', this.handleHidden);
  },

  close: function() {
    $(React.findDOMNode(this)).modal('hide');
  },

  open: function() {
    $(React.findDOMNode(this)).modal('show');
  },

  render: function() {
    var confirmButton = null;
    var cancelButton = null;

    if (this.props.confirm) {
      confirmButton = (
        <BootstrapButton
          onClick={this.handleConfirm}
          className="btn-success">
          {this.props.confirm}
        </BootstrapButton>
      );
    }

    if (this.props.cancel) {
      cancelButton = (
        <BootstrapButton onClick={this.handleCancel} className="btn-warning">
          {this.props.cancel}
        </BootstrapButton>
      );
    }

    return (
      <div className="modal fade">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button
                type="button"
                className="close"
                onClick={this.handleCancel}>
                &times;
              </button>
              <h3>{this.props.title}</h3>
            </div>
            <div className="modal-body">
              {this.props.children}
            </div>
            <div className="modal-footer">
              {cancelButton}
              {confirmButton}
            </div>
          </div>
        </div>
      </div>
    );
  },

  handleCancel: function() {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  },

  handleConfirm: function() {
    if (this.props.onConfirm) {
      this.props.onConfirm();
    }
  }
});

/** ============================================================================
 *  App-specific input (text) element
 * ============================================================================*/
var MyInput = React.createClass({
  getInitialState: function() {
    return {
      value: this.props.value
    };
  },
  
  handleChange: function(evt) {
    this.setState({
      value: evt.target.value
    });

		// Update the global data dirty flag
		isDataDirty = true;
  },
  
  render: function() {
    return (
      <input {...this.props} value={this.state.value} 
			  onChange={this.handleChange}
        href="javascript:;"
				className={(this.props.className || '') + ' form-control'}
        role="input" />
    );
  }
});

/** ============================================================================
 *  App-specific form element
 * ============================================================================*/
var MyForm = React.createClass({
  render: function() {
    return (
      <form {...this.props}
				className={(this.props.className || '') + ' well formWrapper container'}
        href="javascript:;"
				data-toggle="validator"
        role="form" />
    );
  }
});

/** ============================================================================
 *  App-specific label element
 * ============================================================================*/
var MyLabel = React.createClass({
  render: function() {
    return (
      <label {...this.props}
        href="javascript:;"
        role="label" 
        className={(this.props.className || '') + 'control-label'}>
					{this.props.value}:</label>
    );
  }
});

/** ============================================================================
 *  App-specific form group (label/element pairing). Use the "wideInput" or 
 *  "narrowInput" classes to specify wide or narrow input fields respectively.
 * ============================================================================*/
var MyGroup = React.createClass({
	render: function() {
	  return (
			<div className='myGroup form-group has-feedback'>
        <MyLabel
        href="javascript:;"
        role="label"
			  value={this.props.label} />
        <MyInput {...this.props}
        href="javascript:;"
        role="input" 
				value={this.props.data}
        className={(this.props.className || '') + ' form-control '} />
      </div>
	  );											
  }
});

/** ============================================================================
 *  App-specific main form to be displayed
 * ============================================================================*/
var MainForm = React.createClass({
	modal: null,

  handleSubmit: function(evt) {
		if (isDataDirty) {
			var obj = formToObject($("#mainForm"));
			fs.writeFileSync(dataFilePath, JSON.stringify(obj));
		}

		isDataDirty = false;
  },

	handleClose: function(evt) {
		if (isDataDirty) {
		  this.refs.modal.open();
    }
		else {
			this.handleModalConfirm();
    }
  },

  handleModalConfirm: function() {  
		window.close();
  },

  closeModal: function() {
		this.refs.modal.close();
	},
 
  render: function() {
    this.modal = (
      <BootstrapModal
        ref="modal"
        confirm="Yes"
        cancel="No"
        onConfirm={this.closeModal}        // Confirm: do not close, return to editing
        onCancel={this.handleModalConfirm} // Cancel:  exit without saving
        title="Confirm Close">
						Would you like to save your changes before closing?
      </BootstrapModal>
    );

    return (
			<div>
        {this.modal}
        <MyForm id="mainForm" className="form-inline container" onSubmit={this.handleSubmit}>
		      <div id="actions">
					  <button className='btn btn-success' type="submit">
						  <span className="glyphicon glyphicon-floppy-save" aria-hidden="true"></span> Save
				    </button>
            <button className='btn btn-warning' type="button" onClick={this.handleClose}>
						  <span className="glyphicon glyphicon-circle-arrow-left" aria-hidden="true"></span> Close
				    </button>
          </div>
          <div className='row'>
			      <MyGroup data={data.zipcode} className="wideInput" type="text" 
			        placeholder="Zip Code" label="Zip Code" columns="6" ref="zipcode" name="zipcode" 
						  required="true"/>
				
            <MyGroup data={data.shortcode} className="narrowInput" type="text" 
			        placeholder="" label="Short Code" columns="1"  ref="shortcode" name="shortcode" />
          </div>
          <div className='row'>
				    <MyGroup data={data.city} className="wideInput" type="text" 
			         placeholder="City" label="City" columns="6" ref="city"name="city"
				       required="true" />

				    <MyGroup data={data.state} className="narrowInput" type="text" 
			         placeholder="State" label="State" columns="1" ref="state" name="state" 
				       required="true" />
          </div>
        </MyForm>
      </div>
    );
  }
});

/** ============================================================================
 *  Rendering logic
 * ============================================================================*/
React.render(
  <MainForm url="comments.json" pollInterval={2000} />,
  document.getElementById('content')
);

/** ============================================================================
 *  Post-rendering hooks
 * ============================================================================*/
$('#mainForm').validate({
	errorElement: 'span',
  rules: {
    city: {
      minlength: 2,
      required: true
    },
    state: {
      minlength: 2,
      maxlength: 2,
	    required: true
		},
    zipcode: {
      minlength: 5,
      maxlength: 5,
		  number: true,
      required: true
    }
  },

  messages: {
		city: '',
		state: '',
		zipcode: '',
  },

  highlight: function (element) {
    $(element).removeClass('success').addClass('error');
  },
  
  success: function (element) {
	  element.hide();
  }
});


