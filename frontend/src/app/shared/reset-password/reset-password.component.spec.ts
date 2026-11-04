import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { ResetPasswordComponent } from './reset-password.component';
import { AuthService } from '../../core/services/auth.service';

describe('ResetPasswordComponent recovery', () => {
 let component: ResetPasswordComponent;
 let auth: jasmine.SpyObj<AuthService>;
 beforeEach(() => {
  auth=jasmine.createSpyObj('AuthService',['getPasswordResetToken','validateResetToken','resetPassword','clearPasswordResetToken']);
  TestBed.configureTestingModule({providers:[{provide:AuthService,useValue:auth}]});
  component=TestBed.runInInjectionContext(()=>new ResetPasswordComponent());
 });
 it('refuses missing verification credentials',()=>{
  auth.getPasswordResetToken.and.returnValue(null); component.ngOnInit(); component.onSubmit();
  expect(component.isInvalid).toBeTrue(); expect(auth.resetPassword).not.toHaveBeenCalled();
 });
 it('updates once and clears authorization on success',()=>{
  auth.getPasswordResetToken.and.returnValue('secret'); auth.validateResetToken.and.returnValue(of({}));
  const response=new Subject<any>(); auth.resetPassword.and.returnValue(response);
  component.ngOnInit(); component.resetForm.setValue({newPassword:'Password1@',confirmPassword:'Password1@'});
  component.onSubmit(); component.onSubmit();
  expect(auth.resetPassword).toHaveBeenCalledOnceWith('secret','Password1@');
  response.next({success:true}); response.complete();
  expect(component.isSuccess).toBeTrue(); expect(auth.clearPasswordResetToken).toHaveBeenCalled();
 });
 it('does not discard the token for a transient API error',()=>{
  auth.getPasswordResetToken.and.returnValue('secret');
  auth.validateResetToken.and.returnValue(throwError(()=>new HttpErrorResponse({status:0})));
  component.ngOnInit(); expect(component.isInvalid).toBeFalse(); expect(component.submitError).toBeTruthy();
  expect(auth.clearPasswordResetToken).not.toHaveBeenCalled();
 });
});
