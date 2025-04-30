import "./profileInfo.css";

interface ProfileInfoProps {
  username: string;
  title: string;
  titleDescription?: string;
}

export default function ProfileInfo({
  username,
  title,
  titleDescription,
}: ProfileInfoProps) {
  return (
    <div className="profile-info">
      <h1 className="username">{username}</h1>
      <h2 className="title">{title}</h2>
      {titleDescription && (
        <p className="title-description">{titleDescription}</p>
      )}
    </div>
  );
}
