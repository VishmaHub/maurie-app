import { updateUserStatusAction } from "@/lib/admin-user-actions";

interface UserStatusControlProps {
  readonly userId: string;
  readonly isActive: boolean;
  readonly isSelf: boolean;
  readonly returnPath: string;
}

export function UserStatusControl(props: UserStatusControlProps) {
  const nextActive = !props.isActive;
  const isDisabled = props.isSelf && props.isActive;

  return (
    <form action={updateUserStatusAction}>
      <input type="hidden" name="userId" value={props.userId} />
      <input type="hidden" name="nextActive" value={String(nextActive)} />
      <input type="hidden" name="returnPath" value={props.returnPath} />

      <button
        type="submit"
        disabled={isDisabled}
        className={
          isDisabled
            ? "maurie-button-secondary cursor-not-allowed opacity-60"
            : props.isActive
              ? "maurie-button-secondary"
              : "maurie-button-primary"
        }
      >
        {props.isActive ? "Deactivate" : "Activate"}
      </button>

      {isDisabled ? (
        <p className="mt-2 text-xs leading-5 text-[var(--maurie-muted)]">
          You cannot deactivate your own admin account.
        </p>
      ) : null}
    </form>
  );
}
