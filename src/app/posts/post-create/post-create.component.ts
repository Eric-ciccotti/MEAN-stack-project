import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { mimeTypeValidator } from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit {
  enteredContent = '';
  enteredTitle = '';
  post: Post;
  spinnerLoading = false;
  form: FormGroup;
  imagePreview: string;
  private mode = 'create';
  private postId: string | null;

  // @Output()  postCreated = new EventEmitter<Post>();

  ngOnInit(): void {
    //on regarde sur la route change, et si il y a un "postId" en fonction de ça on change de mode
    //si on est en mode edit on récupère le post via le service
    //le point ! c'est pour que typescript même si il voit que c'est null me "fasse confiance"

    // les quotations pour le titre et e content ne sont pas obligatoire en reactiveForme
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      content: new FormControl(null, {
        validators: [Validators.required],
      }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeTypeValidator],
      }),
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.spinnerLoading = true;
        this.postsService.getPost(this.postId).subscribe((postData) => {
          //mettre la propriété du spinner ici dans le subscribe
          this.spinnerLoading = false;
          //data coming from database donc postData._id
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath
          };
          //on re Set la value par defaut du formControl avec les données récupérée par le service
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath
          });
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }

    //pas la peine de le false car on navigue ailleurs
    this.spinnerLoading = true;

    if (this.mode === 'create') {
      this.postsService.addPost(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    } else {
      this.postsService.updatePost(
        this.postId,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image,
      );
    }
    this.form.reset();
  }

  onImagePicked(event: Event) {
    //on explique que cet event est un HTMLinput et on récupère que le 1er element donc [0]
    const file = (event.target as HTMLInputElement).files![0];
    //je corrige la valeur dans mon formulaire
    this.form.patchValue({ image: file });
    //je récupère le champ image et mets à jour sa valeur et sa validité
    this.form.get('image').updateValueAndValidity();

    // je crée une instance de Filereader pour lire le chemin du fichier ( c'est du js natif )
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute
  ) {}
}
