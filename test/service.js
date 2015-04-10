'use strict';

import angular from 'angular';
import 'angular-mocks';
import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import Stripe from 'stripe';
import angularStripe from '../';

const inject = angular.mock.inject;
const expect = chai.expect;

chai.use(sinonChai);

describe('stripe: Service', function () {

  this.timeout(500);

  beforeEach(angular.mock.module(angularStripe));

  let data, response, sandbox;
  beforeEach(function () {
    data = {};
    response = {};
    sandbox = sinon.sandbox.create();
  });
  afterEach(function () {
    sandbox.restore();
  });

  it('exposes #setPublishableKey', inject(function (stripe) {
    expect(stripe.setPublishableKey).to.equal(Stripe.setPublishableKey);
  }));

  describe('card', function () {

    it('exposes helper methods', inject(function (stripe) {
      expect(stripe.card.validateCardNumber).to.equal(Stripe.card.validateCardNumber);
      expect(stripe.card.validateExpiry).to.equal(Stripe.card.validateExpiry);
      expect(stripe.card.validateCVC).to.equal(Stripe.card.validateCVC);
      expect(stripe.card.cardType).to.equal(Stripe.card.cardType);
    }));

    describe('#createToken', function () {

      it('calls the Stripe.js method with the data', function () {
        sandbox.stub(Stripe.card, 'createToken');
        inject((stripe) => {
          stripe.card.createToken(data);
        });
        expect(Stripe.card.createToken).to.have.been.calledWith(data);
      });

      it('can pass params', function () {
        const params = {};
        sandbox.stub(Stripe.card, 'createToken');
        inject((stripe) => {
          stripe.card.createToken(data, params);
        });
        expect(Stripe.card.createToken).to.have.been.calledWith(data, params);
      });

      it('resolves on success', function (done) {
        inject(($timeout) => {
          Stripe.card.createToken = sinon.spy(function (data, callback) {
            $timeout(angular.bind(null, callback, 200, response));
          });
        });
        inject((stripe, $timeout) => {
          stripe.card.createToken(data).then(function (res) {
            expect(res).to.equal(response);
            done();
          });
          $timeout.flush();
        });
      });

      it('rejects on error', function () {
        response.error = {
          code: 'invalid_expiry_year',
          message: 'Your card\'s expiration year is invalid.',
          param: 'exp_year',
          type: 'card_error'
        };
        inject(($timeout) => {
          Stripe.card.createToken = sinon.spy(function (data, callback) {
            $timeout(angular.bind(null, callback, 400, response));
          });
        });
        inject((stripe, $timeout) => {
          let err;
          stripe.card.createToken(data)
            .catch(function (_err_) {
              err = _err_;
            });
          $timeout.flush();
          expect(err).to.contain(response.error);
        });
      });

    });

  });

});
