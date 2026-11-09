import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UsersPage } from "@/routes/users";

const { patch, post, remove, me, resetPassword, clearSession, success, error }=vi.hoisted(()=>({patch:vi.fn(),post:vi.fn(),remove:vi.fn(),me:vi.fn(),resetPassword:vi.fn(),clearSession:vi.fn(()=>sessionStorage.removeItem("dpo_admin_token")),success:vi.fn(),error:vi.fn()}));
let deleted=false;
let user={id:"user-1",name:"Test User",email:"user@example.test",role:"viewer",active:true};
vi.mock("@tanstack/react-router",()=>({createFileRoute:()=> (options:unknown)=>options,Link:({children,to}:any)=><a href={to}>{children}</a>}));
vi.mock("@/lib/api/client",()=>({clearSession,ApiNotConnectedError:class extends Error{}}));
vi.mock("@/lib/notifications",()=>({notify:{success,error}}));
vi.mock("@/lib/api/services",()=>({usersService:{
  list:async()=>deleted?[]:[{...user}], me,
  update:(id:string,body:unknown)=>patch(`/api/admin/users/${id}`,body),
  create:(body:unknown)=>post(body), remove, resetPassword,
}}));

function mount(){const client=new QueryClient({defaultOptions:{queries:{retry:false}}});return render(<QueryClientProvider client={client}><UsersPage/></QueryClientProvider>);}

describe("user status toggle",()=>{
  beforeEach(()=>{vi.clearAllMocks();deleted=false;me.mockResolvedValue({id:"current-admin",name:"Admin",role:"admin",active:true});user={id:"user-1",name:"Test User",email:"user@example.test",role:"viewer",active:true};});
  it("disables repeat changes while saving and displays the confirmed inactive state",async()=>{
    let finish!:(value:unknown)=>void;
    patch.mockReturnValueOnce(new Promise(resolve=>{finish=resolve;}));
    mount();const toggle=await screen.findByRole("switch",{name:"ສະຖານະຂອງ Test User"});
    expect(toggle).toBeChecked();fireEvent.click(toggle);
    await waitFor(()=>expect(patch).toHaveBeenCalledExactlyOnceWith("/api/admin/users/user-1",{active:false}));
    expect(toggle).toBeDisabled();expect(toggle).toBeChecked();
    user.active=false;finish({...user});
    await waitFor(()=>expect(toggle).not.toBeChecked());
    await waitFor(()=>expect(toggle).toBeEnabled());
    expect(screen.getByText("ປິດໃຊ້ງານ")).toBeInTheDocument();
  });
  it("enables an inactive account with the checked value",async()=>{
    user.active=false;patch.mockImplementation(async()=>{user.active=true;return {...user};});
    mount();const toggle=await screen.findByRole("switch");expect(toggle).not.toBeChecked();
    fireEvent.click(toggle);
    await waitFor(()=>expect(patch).toHaveBeenCalledWith("/api/admin/users/user-1",{active:true}));
    await waitFor(()=>expect(toggle).toBeChecked());
  });
  it("keeps the confirmed status when the server rejects the change",async()=>{
    patch.mockRejectedValueOnce(new Error("Cannot disable your own account"));
    mount();const toggle=await screen.findByRole("switch");fireEvent.click(toggle);
    expect(await screen.findByRole("alert")).toHaveTextContent("Cannot disable your own account");
    expect(toggle).toBeChecked();expect(toggle).toBeEnabled();
  });
  it("retains the success container alert after creating a user",async()=>{
    post.mockResolvedValueOnce({...user,id:"new-user"});mount();await screen.findByRole("switch");
    fireEvent.change(screen.getByLabelText("ຊື່"),{target:{value:"New User"}});
    fireEvent.change(screen.getByLabelText("ອີເມວ"),{target:{value:"new@example.test"}});
    fireEvent.change(screen.getByLabelText(/ລະຫັດຜ່ານ/),{target:{value:"test-only-password-123"}});
    fireEvent.click(screen.getByRole("button",{name:"ເພີ່ມຜູ້ໃຊ້"}));
    await waitFor(()=>expect(success).toHaveBeenCalledWith("ເພີ່ມຜູ້ໃຊ້ສຳເລັດ"));
    expect(screen.getByLabelText("ຊື່")).toHaveValue("");
  });
  it("requires confirmation and supports cancelling without deleting",async()=>{
    mount();const button=await screen.findByRole("button",{name:"ລຶບບັນຊີ Test User"});
    await waitFor(()=>expect(button).toBeEnabled());fireEvent.click(button);
    const dialog=screen.getByRole("alertdialog");expect(dialog).toHaveTextContent("Test User");expect(dialog).toHaveTextContent("user@example.test");
    expect(remove).not.toHaveBeenCalled();fireEvent.click(within(dialog).getByRole("button",{name:"ຍົກເລີກ"}));
    await waitFor(()=>expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());expect(remove).not.toHaveBeenCalled();
  });
  it("deletes after confirmation, blocks repeat changes and refreshes the user list",async()=>{
    let finish!:()=>void;remove.mockReturnValueOnce(new Promise<void>(resolve=>{finish=resolve;}));
    mount();const button=await screen.findByRole("button",{name:"ລຶບບັນຊີ Test User"});
    await waitFor(()=>expect(button).toBeEnabled());fireEvent.click(button);
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button",{name:"ລຶບ"}));
    await waitFor(()=>expect(remove).toHaveBeenCalledExactlyOnceWith("user-1"));
    expect(screen.getByRole("switch",{hidden:true})).toBeDisabled();
    expect(within(screen.getByRole("alertdialog")).getByRole("button",{name:"ຍົກເລີກ"})).toBeDisabled();
    deleted=true;finish();
    await waitFor(()=>expect(success).toHaveBeenCalledWith("ລຶບບັນຊີສຳເລັດ"));
    expect(screen.queryByText("Test User")).not.toBeInTheDocument();
  });
  it("keeps the account and allows retry when deletion fails",async()=>{
    remove.mockRejectedValueOnce(new Error("Forbidden"));mount();
    const button=await screen.findByRole("button",{name:"ລຶບບັນຊີ Test User"});await waitFor(()=>expect(button).toBeEnabled());fireEvent.click(button);
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button",{name:"ລຶບ"}));
    await waitFor(()=>expect(error).toHaveBeenCalledWith(expect.stringContaining("Forbidden")));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("Test User");
    expect(within(screen.getByRole("alertdialog")).getByRole("button",{name:"ລຶບ"})).toBeEnabled();
    expect(success).not.toHaveBeenCalled();
  });
  it("disables deletion for the signed-in account",async()=>{
    me.mockResolvedValue({...user});mount();
    const button=await screen.findByRole("button",{name:"ລຶບບັນຊີ Test User"});
    expect(button).toBeDisabled();fireEvent.click(button);expect(remove).not.toHaveBeenCalled();
  });

  it("shows and hides the creation password without submitting the form",async()=>{
    mount();await screen.findByRole("switch");const input=screen.getByLabelText("ລະຫັດຜ່ານ");
    fireEvent.change(input,{target:{value:"test-only-password-123"}});expect(input).toHaveAttribute("type","password");
    fireEvent.click(screen.getByRole("button",{name:"Show password"}));expect(input).toHaveAttribute("type","text");
    expect(input).toHaveValue("test-only-password-123");expect(post).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button",{name:"Hide password"}));expect(input).toHaveAttribute("type","password");
  });
  it("validates reset confirmation and does not send mismatched passwords",async()=>{
    mount();fireEvent.click(await screen.findByRole("button",{name:"Reset Password Test User"}));
    const dialog=screen.getByRole("dialog");expect(dialog).toHaveTextContent(user.email);
    fireEvent.change(within(dialog).getByLabelText("ລະຫັດຜ່ານໃໝ່"),{target:{value:"new-test-password-123"}});
    fireEvent.change(within(dialog).getByLabelText("ຢືນຢັນລະຫັດຜ່ານ"),{target:{value:"other-test-password-123"}});
    fireEvent.click(within(dialog).getByRole("button",{name:"Reset Password"}));
    expect(within(dialog).getByRole("alert")).toHaveTextContent("ລະຫັດຜ່ານບໍ່ກົງກັນ");expect(resetPassword).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole("button",{name:"ຍົກເລີກ"}));
    await waitFor(()=>expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button",{name:"Reset Password Test User"}));
    expect(screen.getByLabelText("ລະຫັດຜ່ານໃໝ່")).toHaveValue("");
  });
  it("resets only the chosen account and blocks duplicate requests while pending",async()=>{
    let finish!:(value:unknown)=>void;resetPassword.mockReturnValueOnce(new Promise(resolve=>{finish=resolve;}));
    mount();fireEvent.click(await screen.findByRole("button",{name:"Reset Password Test User"}));
    const dialog=screen.getByRole("dialog"),password="six123";
    fireEvent.change(within(dialog).getByLabelText("ລະຫັດຜ່ານໃໝ່"),{target:{value:password}});
    fireEvent.change(within(dialog).getByLabelText("ຢືນຢັນລະຫັດຜ່ານ"),{target:{value:password}});
    fireEvent.click(within(dialog).getByRole("button",{name:"Reset Password"}));
    await waitFor(()=>expect(resetPassword).toHaveBeenCalledExactlyOnceWith("user-1",password));
    expect(within(dialog).getByLabelText("ລະຫັດຜ່ານໃໝ່")).toBeDisabled();expect(within(dialog).getByRole("button",{name:"ຍົກເລີກ"})).toBeDisabled();
    finish({...user});await waitFor(()=>expect(success).toHaveBeenCalledWith("Reset Password ສຳເລັດ"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();expect(patch).not.toHaveBeenCalled();
  });
  it("keeps reset inputs available for retry after an API error",async()=>{
    resetPassword.mockRejectedValueOnce(new Error("Connection failed"));mount();fireEvent.click(await screen.findByRole("button",{name:"Reset Password Test User"}));
    const dialog=screen.getByRole("dialog"),password="new-test-password-123";
    fireEvent.change(within(dialog).getByLabelText("ລະຫັດຜ່ານໃໝ່"),{target:{value:password}});
    fireEvent.change(within(dialog).getByLabelText("ຢືນຢັນລະຫັດຜ່ານ"),{target:{value:password}});
    fireEvent.click(within(dialog).getByRole("button",{name:"Reset Password"}));
    await waitFor(()=>expect(error).toHaveBeenCalledWith(expect.stringContaining("Connection failed")));
    expect(within(dialog).getByLabelText("ລະຫັດຜ່ານໃໝ່")).toHaveValue(password);expect(within(dialog).getByRole("button",{name:"Reset Password"})).toBeEnabled();
  });
  it("clears the local session after resetting the signed-in account",async()=>{
    me.mockResolvedValue({...user});resetPassword.mockResolvedValueOnce({...user});sessionStorage.setItem("dpo_admin_token","test-session");
    const expired=vi.fn();window.addEventListener("dpo-session-expired",expired);
    try{
      mount();fireEvent.click(await screen.findByRole("button",{name:"Reset Password Test User"}));const dialog=screen.getByRole("dialog"),password="new-test-password-123";
      fireEvent.change(within(dialog).getByLabelText("ລະຫັດຜ່ານໃໝ່"),{target:{value:password}});
      fireEvent.change(within(dialog).getByLabelText("ຢືນຢັນລະຫັດຜ່ານ"),{target:{value:password}});
      fireEvent.click(within(dialog).getByRole("button",{name:"Reset Password"}));
      await waitFor(()=>expect(expired).toHaveBeenCalledTimes(1));expect(sessionStorage.getItem("dpo_admin_token")).toBeNull();
    }finally{window.removeEventListener("dpo-session-expired",expired);sessionStorage.clear();}
  });

});
