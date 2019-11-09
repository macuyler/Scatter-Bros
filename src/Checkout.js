import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { Redirect } from "react-router";
import { Paper, Typography, TextField, Button, Modal } from "@material-ui/core";
import { Elements, injectStripe, CardElement } from 'react-stripe-elements';

class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fName: "",
      lName: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zip: ""
    };
    this.getToken = this.getToken.bind(this);
  }

  getToken = async (e) => {
    e.preventDefault();
    const { token } = await this.props.stripe.createToken({ name: 'Name' });
    this.props.handleSubmit(token, this.state);
  };

  render() {
    return (
      <form className="checkout-form" onSubmit={this.getToken}>
        <div className="default-flex">
          <div className="text-field-left">
            <TextField
              fullWidth
              id="outlined-basic"
              className="textField"
              label="First Name"
              margin="normal"
              variant="outlined"
              value={this.state.fName}
              onChange={e => this.setState({ fName: e.target.value })}
            />
          </div>
          <div className="text-field-right">
            <TextField
              fullWidth
              id="outlined-basic"
              className="textField"
              label="Last Name"
              margin="normal"
              variant="outlined"
              value={this.state.lName}
              onChange={e => this.setState({ lName: e.target.value })}
            />
          </div>
        </div>
        <TextField
          fullWidth
          id="outlined-basic"
          className="text-field"
          label="Email"
          margin="normal"
          variant="outlined"
          color="secondary"
          value={this.state.email}
          onChange={e => this.setState({ email: e.target.value })}
        />
        <TextField
          fullWidth
          id="outlined-basic"
          className="text-field"
          label="Shipping Address"
          margin="normal"
          variant="outlined"
          value={this.state.address}
          onChange={e => this.setState({ address: e.target.value })}
        />
        <div className="default-flex">
          <div className="text-field-left">
            <TextField
              fullWidth
              id="outlined-basic"
              className="textField"
              label="City"
              margin="normal"
              variant="outlined"
              color="secondary"
              value={this.state.city}
              onChange={e => this.setState({ city: e.target.value })}
            />
          </div>
          <div className="text-field-center">
            <TextField
              fullWidth
              id="outlined-basic"
              className="textField"
              label="State"
              margin="normal"
              color="secondary"
              variant="outlined"
              value={this.state.state}
              onChange={e => this.setState({ state: e.target.value })}
            />
          </div>
          <div className="text-field-right" style={{ marginBottom: 20 }}>
            <TextField
              fullWidth
              id="outlined-basic"
              className="textField"
              label="Zip Code"
              margin="normal"
              color="secondary"
              variant="outlined"
              value={this.state.zip}
              onChange={e => this.setState({ zip: e.target.value })}
            />
          </div>
        </div>
        <CardElement />
        <Button type="submit" style={{ width: '40%', marginTop: 24, marginLeft: '30%' }} variant="contained" color="primary">Submit</Button>
      </form>
    )
  }
}
const StripeFrom = injectStripe(Form);

class Checkout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      token: null,
      price: 0
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(token, data) {
    const { parts, name } = this.props.location.state;
    const { fName, lName, email, address, city, state, zip } = data;
    let total = 5;
    parts.forEach(p => total += p.quantity * 0.5);
    if (token) {
      fetch('http://localhost:9000/buy', {
        method: 'POST',
        body: JSON.stringify({
          token: token.id,
          price: total
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((res) => {
        if (res.status === 200) {
          this.props.db
            .collection('purchases')
            .doc()
            .set({ fName, lName, email, address, city, state, zip, parts, name, dateSubmitted: Date.now() })
            .then(() => this.setState({ showModal: true }))
            .catch(err => console.log(err));
        } else {
          console.log(res);
          this.setState({ showModal: true });
        }
      })
    }
  }

  render() {
    const carts = this.props.location.state;

    const pipeNames = {
      pipe2: "2 Inch Pipe",
      pipe3: "3 Inch Pipe",
      pipe5: "5 Inch Pipe",
      pipe7: "7 Inch Pipe",
      pipe90: "90-Degree Elbow",
      pipet: "Tee Connector",
      pipecap: "Cap",
      pipecon: "Coupling"
    };

    const pipeImages = {
      pipe2: "https://images-na.ssl-images-amazon.com/images/I/51YAw0xjeFL._SX466_.jpg",
      pipe3: "https://images-na.ssl-images-amazon.com/images/I/51YAw0xjeFL._SX466_.jpg",
      pipe5: "https://images-na.ssl-images-amazon.com/images/I/51YAw0xjeFL._SX466_.jpg",
      pipe7: "https://images-na.ssl-images-amazon.com/images/I/51YAw0xjeFL._SX466_.jpg",
      pipe90:
        "https://images.homedepot-static.com/productImages/30ce963e-181e-4659-97b7-947c40533f05/svn/white-dura-pvc-fittings-406-080-64_1000.jpg",
      pipet: "https://mobileimages.lowes.com/product/converted/611942/611942124589.jpg?size=xl",
      pipecap:
        "https://images.homedepot-static.com/productImages/1251b43b-d36d-40ba-b060-9d00ab5c7de1/svn/white-charlotte-pipe-pvc-fittings-pvc021161000hd-64_1000.jpg",
      pipecon: "https://mobileimages.lowes.com/product/converted/052063/052063444055.jpg?size=xl"
    };

    const getPipeName = pipe => {
      return pipeNames[pipe];
    };

    const getPipeImage = pipe => {
      return pipeImages[pipe];
    };

    const getSubtotal = () => {
      let subtotal = 0;
      carts.parts.forEach(item => {
        subtotal += item.quantity;
      });
      return subtotal;
    };

    const toCurrency = amount => {
      amount *= 0.5;
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
    };

    return (
      <div className="checkout-mainContent">
        <div className="checkout-leftContent">
          <Paper>
            <div className="cart-content">
              <Typography variant="h5" component="h3">
                Items in your Kit
              </Typography>
              <div className="cart-header">
                <p className="cart-heading">Item</p>
                <div className="end-items-heading">
                  <p className="cart-heading cart-quantity">Qty</p>
                  <p className="cart-heading item-total">Item Total</p>
                </div>
              </div>
              {carts.parts.map(item => {
                if (item.quantity > 0) {
                  return (
                    <div key={item.pipeType} className="cart-item">
                      <div className="cart-item-details">
                        <div className="cart-item-image-wrapper">
                          <img src={getPipeImage(item.pipeType)} alt="pipe" />
                        </div>
                        <p className="cart-item-name">{getPipeName(item.pipeType)}</p>
                      </div>
                      <div className="end-items">
                        <p className="cart-quantity">{item.quantity}</p>
                        <p className="item-total">{toCurrency(item.quantity)}</p>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </Paper>
        </div>
        <div className="checkout-rightContent">
          <Paper>
            <div className="item-subtotal">
              <Typography variant="h6" component="h3">
                Subtotal
              </Typography>
              <Typography variant="h6" component="h3">
                {toCurrency(getSubtotal())}
              </Typography>
            </div>
            <div className="item-subtotal" style={{ paddingTop: 0, color: "#a9a9a9" }}>
              <Typography variant="h6" component="h3">
                Shipping <span style={{ fontSize: '0.75rem', marginLeft: 10 }}>($5.00 flat rate shipping anywhere in the US)</span>
              </Typography>
              <Typography variant="h6" component="h3">
                $5.00
              </Typography>
            </div>
            <div className="item-subtotal" style={{ paddingTop: 10 }}>
              <Typography variant="h5" component="h3">
                Grand Total
              </Typography>
              <Typography variant="h5" component="h3">
                {toCurrency(getSubtotal() + 10)}
              </Typography>
            </div>
            <Elements>
              <StripeFrom handleSubmit={this.handleSubmit} />
            </Elements>
          </Paper>
        </div>
        <Modal
          aria-labelledby="Successfully Placed your Order"
          aria-describedby="Your Purchase will be processed and shipped within 3-5 business days."
          open={this.state.showModal}
          onClose={() => {}}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          disableAutoFocus
        >
          <Paper style={{ width: '50%', height: 300, outline: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1 style={{ textAlign: 'center' }}>Successfully Placed your Order</h1>
            <p style={{ textAlign: 'center', marginTop: 0 }}>Your Purchase will be processed and shipped within 3-5 business days.</p>
            <Button style={{ width: '30%', marginTop: 10 }} variant="contained" color="primary"><Link to="/" style={{ textDecoration: 'none', color: '#fff' }}>Return to HomePage</Link></Button>
          </Paper>
        </Modal>
        {!carts || (carts && carts.parts.length === 0) ? <Redirect to={{ pathname: "/edit" }} /> : null}
      </div>
    );
  }
}

export default Checkout;
